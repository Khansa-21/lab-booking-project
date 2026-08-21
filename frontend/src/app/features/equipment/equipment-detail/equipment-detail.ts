import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { Equipment } from '../equipment.models';
import { EquipmentService } from '../equipment';
import { AvailabilityTimeline } from '../availability-timeline/availability-timeline';

@Component({
  selector: 'app-equipment-detail',
  imports: [AvailabilityTimeline, RouterLink],
  templateUrl: './equipment-detail.html',
  styleUrl: './equipment-detail.scss',
})
export class EquipmentDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly equipmentService = inject(EquipmentService);

  readonly equipment = signal<Equipment | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.equipmentService
      .getEquipmentById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.equipment.set(response.equipment),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
