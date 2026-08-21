import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { getApiErrorMessage } from '../../auth/auth';
import { AdminTrainingService, TrainingManagementData, TrainingUser } from '../admin-training';

@Component({
  selector: 'app-training-management',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './training-management.html',
  styleUrl: './training-management.scss',
})
export class TrainingManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly training = inject(AdminTrainingService);
  readonly data = signal<TrainingManagementData | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal('');
  readonly userSearch = signal('');
  readonly userResults = signal<TrainingUser[]>([]);
  readonly selectedUser = signal<TrainingUser | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    userId: [0, [Validators.required, Validators.min(1)]],
    equipmentId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void { this.load(); }

  markComplete(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set('');
    this.training
      .completeTraining(this.form.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.form.reset({ userId: 0, equipmentId: 0 });
          this.userSearch.set('');
          this.selectedUser.set(null);
          this.load();
        },
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  searchUsers(value: string): void {
    const search = value.trim();
    this.userSearch.set(value);
    if (search.length < 2) {
      this.userResults.set([]);
      return;
    }
    this.training.searchUsers(search).subscribe({
      next: (response) => {
        if (this.userSearch().trim() === search) this.userResults.set(response.users);
      },
      error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
    });
  }

  selectUser(user: TrainingUser): void {
    this.selectedUser.set(user);
    this.userResults.set([]);
    this.userSearch.set(`${user.name} — ${user.email}`);
    this.form.controls.userId.setValue(user.id);
  }

  private load(): void {
    this.loading.set(true);
    this.training
      .getManagementData()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.data.set(data),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
