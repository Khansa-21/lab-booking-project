import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { BookingAudience, Equipment, EquipmentStatus } from '../../equipment/equipment.models';
import {
  AdminCategory,
  AdminResourceService,
  CategoryRequest,
  EquipmentRequest,
} from '../admin-resource';

@Component({
  selector: 'app-resource-management',
  imports: [ReactiveFormsModule],
  templateUrl: './resource-management.html',
  styleUrl: './resource-management.scss',
})
export class ResourceManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminResources = inject(AdminResourceService);

  readonly categories = signal<AdminCategory[]>([]);
  readonly equipment = signal<Equipment[]>([]);
  readonly editingCategoryId = signal<number | null>(null);
  readonly editingEquipmentId = signal<number | null>(null);
  readonly editingEquipmentName = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly statuses: EquipmentStatus[] = ['AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE'];
  readonly audiences: BookingAudience[] = ['STUDENT_AND_TEACHER', 'TEACHER_ONLY'];

  readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(1000)],
    isActive: true,
  });
  readonly equipmentForm = this.formBuilder.nonNullable.group({
    categoryId: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    description: ['', Validators.maxLength(1000)],
    location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    imageUrl: ['', [Validators.maxLength(500), Validators.pattern(/^https?:\/\/\S+$/i)]],
    status: ['AVAILABLE' as EquipmentStatus],
    bookingAudience: ['STUDENT_AND_TEACHER' as BookingAudience],
    requiresApproval: false,
    requiresTraining: false,
    maxBookingHours: [2, [Validators.required, Validators.min(0.01), Validators.max(24)]],
  });

  ngOnInit(): void {
    this.loadResources();
  }

  saveCategory(): void {
    if (this.categoryForm.invalid || this.saving()) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const values = this.categoryForm.getRawValue();
    const request: CategoryRequest = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      isActive: values.isActive,
    };
    const editingId = this.editingCategoryId();
    const action = editingId
      ? this.adminResources.updateCategory(editingId, request)
      : this.adminResources.createCategory(request);

    this.save(action, () => {
      this.resetCategoryForm();
      this.loadResources();
    });
  }

  saveEquipment(): void {
    if (this.equipmentForm.invalid || this.saving()) {
      this.equipmentForm.markAllAsTouched();
      return;
    }

    const values = this.equipmentForm.getRawValue();
    const request: EquipmentRequest = {
      ...values,
      name: values.name.trim(),
      description: values.description.trim() || null,
      location: values.location.trim(),
      imageUrl: values.imageUrl.trim() || null,
    };
    const editingId = this.editingEquipmentId();
    const action = editingId
      ? this.adminResources.updateEquipment(editingId, request)
      : this.adminResources.createEquipment(request);

    this.save(action, () => {
      this.resetEquipmentForm();
      this.loadResources();
    });
  }

  editCategory(category: AdminCategory): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.setValue({
      name: category.name,
      description: category.description ?? '',
      isActive: category.isActive,
    });
  }

  editEquipment(item: Equipment): void {
    this.editingEquipmentId.set(item.id);
    this.editingEquipmentName.set(item.name);
    this.equipmentForm.setValue({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? '',
      location: item.location,
      imageUrl: item.imageUrl ?? '',
      status: item.status,
      bookingAudience: item.bookingAudience,
      requiresApproval: item.requiresApproval,
      requiresTraining: item.requiresTraining,
      maxBookingHours: Number(item.maxBookingHours),
    });
  }

  resetCategoryForm(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ name: '', description: '', isActive: true });
  }

  resetEquipmentForm(): void {
    this.editingEquipmentId.set(null);
    this.editingEquipmentName.set('');
    this.equipmentForm.reset({
      categoryId: 0,
      name: '',
      description: '',
      location: '',
      imageUrl: '',
      status: 'AVAILABLE',
      bookingAudience: 'STUDENT_AND_TEACHER',
      requiresApproval: false,
      requiresTraining: false,
      maxBookingHours: 2,
    });
  }

  private loadResources(): void {
    this.loading.set(true);
    this.adminResources
      .getResources()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.categories.set(response.categories);
          this.equipment.set(response.equipment);
        },
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  private save(action: Observable<unknown>, onSuccess: () => void): void {
    this.saving.set(true);
    this.errorMessage.set('');
    action.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: onSuccess,
      error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
    });
  }
}
