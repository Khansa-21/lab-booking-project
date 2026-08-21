import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { CheckInService } from '../../check-in/check-in';
import { Reservation } from '../../reservations/reservation.models';

@Component({
  selector: 'app-check-in-management',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './check-in-management.html',
  styleUrl: './check-in-management.scss',
})
export class CheckInManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly checkIn = inject(CheckInService);
  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly checkingIn = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{12}$/)]],
  });

  ngOnInit(): void { this.loadToday(); }

  submit(): void {
    if (this.form.invalid || this.checkingIn()) {
      this.form.markAllAsTouched();
      return;
    }
    this.checkingIn.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.checkIn.checkIn(this.form.controls.code.value.trim().toUpperCase())
      .pipe(finalize(() => this.checkingIn.set(false)))
      .subscribe({
        next: () => { this.form.reset({ code: '' }); this.successMessage.set('Check-in recorded.'); this.loadToday(); },
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  private loadToday(): void {
    this.loading.set(true);
    this.checkIn.getToday().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (response) => this.reservations.set(response.reservations),
      error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
    });
  }
}
