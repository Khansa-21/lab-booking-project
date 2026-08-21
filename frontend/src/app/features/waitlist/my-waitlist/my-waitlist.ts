import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { WaitlistService } from '../waitlist';
import { WaitlistEntry } from '../waitlist.models';

@Component({
  selector: 'app-my-waitlist',
  imports: [DatePipe],
  templateUrl: './my-waitlist.html',
  styleUrl: './my-waitlist.scss',
})
export class MyWaitlist implements OnInit {
  private readonly waitlistService = inject(WaitlistService);

  readonly entries = signal<WaitlistEntry[]>([]);
  readonly loading = signal(true);
  readonly cancellingId = signal<number | null>(null);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.waitlistService
      .getMine()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.entries.set(response.entries),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  cancel(id: number): void {
    if (this.cancellingId() !== null) return;
    this.cancellingId.set(id);
    this.waitlistService
      .cancel(id)
      .pipe(finalize(() => this.cancellingId.set(null)))
      .subscribe({
        next: (response) => this.entries.update((items) =>
          items.map((item) => item.id === id ? { ...item, ...response.entry } : item),
        ),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
