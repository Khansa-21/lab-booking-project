import { DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { AvailabilityInterval } from '../equipment.models';
import { EquipmentService } from '../equipment';

interface TimelineBar {
  startDateTime: string;
  endDateTime: string;
  left: number;
  width: number;
  showLabel: boolean;
}

function localDateValue(date = new Date()): string {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-availability-timeline',
  imports: [DatePipe],
  templateUrl: './availability-timeline.html',
  styleUrl: './availability-timeline.scss',
})
export class AvailabilityTimeline implements OnInit {
  private readonly equipmentService = inject(EquipmentService);

  @Input({ required: true }) equipmentId!: number;

  readonly selectedDate = signal(localDateValue());
  readonly intervals = signal<AvailabilityInterval[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadAvailability();
  }

  updateDate(date: string): void {
    if (!date) return;
    this.selectedDate.set(date);
    this.loadAvailability();
  }

  timelineBars(): TimelineBar[] {
    const { start, end } = this.dayRange();
    const dayLength = end.getTime() - start.getTime();

    return this.intervals().map((item) => {
      const itemStart = new Date(item.startDateTime);
      const itemEnd = new Date(item.endDateTime);
      const visibleStart = Math.max(itemStart.getTime(), start.getTime());
      const visibleEnd = Math.min(itemEnd.getTime(), end.getTime());

      const width = ((visibleEnd - visibleStart) / dayLength) * 100;
      return {
        ...item,
        left: ((visibleStart - start.getTime()) / dayLength) * 100,
        width,
        showLabel: width >= 9,
      };
    });
  }

  private loadAvailability(): void {
    const { start, end } = this.dayRange();
    this.loading.set(true);
    this.errorMessage.set('');

    this.equipmentService
      .getAvailability(this.equipmentId, start, end)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.intervals.set(response.availability),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  private dayRange(): { start: Date; end: Date } {
    const start = new Date(`${this.selectedDate()}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }
}
