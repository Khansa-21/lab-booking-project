import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { EligibilityService, TrainingRecord } from '../eligibility';

@Component({
  selector: 'app-my-eligibility',
  imports: [DatePipe],
  templateUrl: './my-eligibility.html',
  styleUrl: './my-eligibility.scss',
})
export class MyEligibility implements OnInit {
  private readonly eligibility = inject(EligibilityService);
  readonly records = signal<TrainingRecord[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.eligibility
      .getMine()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.records.set(response.records),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
