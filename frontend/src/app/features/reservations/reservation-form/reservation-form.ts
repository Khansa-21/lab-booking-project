import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { ReservationService } from '../reservation';
import { BookingAlternatives } from '../../equipment/equipment.models';
import { EquipmentService } from '../../equipment/equipment';
import { WaitlistService } from '../../waitlist/waitlist';

const validTimeRange: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const start = control.get('startDateTime')?.value;
  const end = control.get('endDateTime')?.value;
  return start && end && new Date(end) <= new Date(start)
    ? { invalidTimeRange: true }
    : null;
};

@Component({
  selector: 'app-reservation-form',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.scss',
})
export class ReservationForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly reservationService = inject(ReservationService);
  private readonly equipmentService = inject(EquipmentService);
  private readonly waitlistService = inject(WaitlistService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly equipmentId = Number(this.route.snapshot.paramMap.get('id'));
  readonly pending = signal(false);
  readonly errorMessage = signal('');
  readonly alternatives = signal<BookingAlternatives | null>(null);
  readonly joiningWaitlist = signal(false);
  readonly form = this.formBuilder.nonNullable.group(
    {
      startDateTime: ['', Validators.required],
      endDateTime: ['', Validators.required],
      purpose: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    },
    { validators: validTimeRange },
  );

  constructor() {
    const start = this.route.snapshot.queryParamMap.get('start');
    const end = this.route.snapshot.queryParamMap.get('end');
    if (start || end) this.form.patchValue({ startDateTime: start ?? '', endDateTime: end ?? '' });
  }

  submit(): void {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const startDateTime = new Date(values.startDateTime);
    const endDateTime = new Date(values.endDateTime);
    this.pending.set(true);
    this.errorMessage.set('');
    this.alternatives.set(null);

    this.reservationService
      .create({
        equipmentId: this.equipmentId,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        purpose: values.purpose.trim(),
      })
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/reservations']),
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error));
          if (error instanceof HttpErrorResponse && error.status === 409) {
            this.loadAlternatives(startDateTime, endDateTime);
          }
        },
      });
  }

  useNextSlot(): void {
    const nextSlot = this.alternatives()?.nextSlot;
    if (!nextSlot) return;

    this.form.patchValue({
      startDateTime: this.toDateTimeInput(nextSlot.startDateTime),
      endDateTime: this.toDateTimeInput(nextSlot.endDateTime),
    });
    this.alternatives.set(null);
    this.errorMessage.set('');
  }

  chooseAlternative(equipmentId: number): void {
    const values = this.form.getRawValue();
    void this.router.navigate(['/equipment', equipmentId, 'book'], {
      queryParams: { start: values.startDateTime, end: values.endDateTime },
    });
  }

  joinWaitlist(): void {
    if (this.joiningWaitlist() || this.form.invalid) return;

    const values = this.form.getRawValue();
    this.joiningWaitlist.set(true);
    this.waitlistService
      .join({
        equipmentId: this.equipmentId,
        startDateTime: new Date(values.startDateTime).toISOString(),
        endDateTime: new Date(values.endDateTime).toISOString(),
        purpose: values.purpose.trim(),
      })
      .pipe(finalize(() => this.joiningWaitlist.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/waitlist']),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  private loadAlternatives(start: Date, end: Date): void {
    this.equipmentService.getBookingAlternatives(this.equipmentId, start, end).subscribe({
      next: (response) => this.alternatives.set(response.alternatives),
    });
  }

  private toDateTimeInput(value: string): string {
    const date = new Date(value);
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }
}
