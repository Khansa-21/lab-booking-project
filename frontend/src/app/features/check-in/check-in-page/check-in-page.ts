import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import QRCode from 'qrcode';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { Reservation } from '../../reservations/reservation.models';
import { ReservationService } from '../../reservations/reservation';

@Component({
  selector: 'app-check-in-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './check-in-page.html',
  styleUrl: './check-in-page.scss',
})
export class CheckInPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reservations = inject(ReservationService);
  readonly reservation = signal<Reservation | null>(null);
  readonly qrImage = signal('');
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reservations.getMine().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: async (response) => {
        const reservation = response.reservations.find((item) => item.id === id) ?? null;
        this.reservation.set(reservation);
        if (reservation?.checkInCode) {
          this.qrImage.set(await QRCode.toDataURL(reservation.checkInCode, { width: 260, margin: 1 }));
        }
      },
      error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
    });
  }
}
