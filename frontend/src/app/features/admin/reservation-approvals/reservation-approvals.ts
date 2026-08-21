import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { Reservation } from '../../reservations/reservation.models';
import { ReservationService } from '../../reservations/reservation';

@Component({
  selector: 'app-reservation-approvals',
  imports: [DatePipe],
  templateUrl: './reservation-approvals.html',
  styleUrl: './reservation-approvals.scss',
})
export class ReservationApprovals implements OnInit {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly processingId = signal<number | null>(null);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadPending();
  }

  review(id: number, action: 'APPROVE' | 'REJECT'): void {
    if (this.processingId() !== null) return;

    this.processingId.set(id);
    this.errorMessage.set('');
    this.reservationService
      .review(id, action)
      .pipe(finalize(() => this.processingId.set(null)))
      .subscribe({
        next: () => this.reservations.update((items) => items.filter((item) => item.id !== id)),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  private loadPending(): void {
    this.reservationService
      .getPending()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.reservations.set(response.reservations),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
