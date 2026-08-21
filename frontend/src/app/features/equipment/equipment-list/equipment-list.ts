import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { Category, Equipment, EquipmentStatus } from '../equipment.models';
import { EquipmentService } from '../equipment';

@Component({
  selector: 'app-equipment-list',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './equipment-list.html',
  styleUrl: './equipment-list.scss',
})
export class EquipmentList implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly equipmentService = inject(EquipmentService);

  readonly equipment = signal<Equipment[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly statuses: EquipmentStatus[] = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];
  readonly filters = this.formBuilder.nonNullable.group({
    search: '',
    categoryId: '',
    status: '',
  });

  ngOnInit(): void {
    forkJoin({
      categories: this.equipmentService.getCategories(),
      equipment: this.equipmentService.getEquipment(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ categories, equipment }) => {
          this.categories.set(categories.categories);
          this.equipment.set(equipment.equipment);
        },
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  applyFilters(): void {
    const values = this.filters.getRawValue();
    this.loading.set(true);
    this.errorMessage.set('');

    this.equipmentService
      .getEquipment({
        search: values.search.trim() || undefined,
        categoryId: values.categoryId ? Number(values.categoryId) : undefined,
        status: (values.status as EquipmentStatus) || undefined,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.equipment.set(response.equipment),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  clearFilters(): void {
    this.filters.reset();
    this.applyFilters();
  }
}
