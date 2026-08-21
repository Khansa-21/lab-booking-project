import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService, getApiErrorMessage } from '../auth/auth';
import { ReservationService } from '../reservations/reservation';
import { Reservation } from '../reservations/reservation.models';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly reservationService = inject(ReservationService);

  readonly user = this.auth.user;
  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly upcoming = computed(() =>
    this.reservations().filter(
      (item) => new Date(item.startDateTime) > new Date() && item.status === 'APPROVED',
    ),
  );
  readonly pending = computed(() =>
    this.reservations().filter((item) => item.status === 'PENDING'),
  );
  readonly completed = computed(() =>
    this.reservations().filter((item) => item.status === 'COMPLETED'),
  );

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      void this.router.navigate(['/admin']);
      return;
    }
    this.reservationService
      .getMine()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.reservations.set(response.reservations),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
