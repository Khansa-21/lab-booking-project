import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { OperationsSummary } from '../../reservations/reservation.models';
import { ReservationService } from '../../reservations/reservation';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly reservationService = inject(ReservationService);

  readonly summary = signal<OperationsSummary | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.reservationService
      .getOperationsSummary()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.summary.set(response.summary),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
