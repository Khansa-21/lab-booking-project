import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { Reservation } from '../reservation.models';
import { ReservationService } from '../reservation';

@Component({
  selector: 'app-my-reservations',
  imports: [DatePipe, RouterLink],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss',
})
export class MyReservations implements OnInit {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly cancellingId = signal<number | null>(null);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadReservations();
  }

  canCancel(reservation: Reservation): boolean {
    return (
      ['PENDING', 'APPROVED'].includes(reservation.status) &&
      new Date(reservation.startDateTime) > new Date()
    );
  }

  cancel(id: number): void {
    if (this.cancellingId() !== null) return;

    this.cancellingId.set(id);
    this.errorMessage.set('');
    this.reservationService
      .cancel(id)
      .pipe(finalize(() => this.cancellingId.set(null)))
      .subscribe({
        next: (response) =>
          this.reservations.update((items) =>
            items.map((item) => (item.id === id ? { ...item, ...response.reservation } : item)),
          ),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  private loadReservations(): void {
    this.reservationService
      .getMine()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.reservations.set(response.reservations),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
