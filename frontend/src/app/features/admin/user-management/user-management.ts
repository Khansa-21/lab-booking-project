import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AuthService, getApiErrorMessage } from '../../auth/auth';
import { AdminUser, AdminUserService } from '../admin-user';

@Component({
  selector: 'app-user-management',
  imports: [ReactiveFormsModule],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagement implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly adminUsers = inject(AdminUserService);
  private readonly auth = inject(AuthService);

  readonly users = signal<AdminUser[]>([]);
  readonly currentUser = this.auth.user;
  readonly currentPage = signal(1);
  readonly pageSize = 10;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.users().length / this.pageSize)));
  readonly paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.users().slice(start, start + this.pageSize);
  });
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deletingUserId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30),
        Validators.pattern(/[a-z]/),
        Validators.pattern(/[A-Z]/),
        Validators.pattern(/[0-9]/),
        Validators.pattern(/[^A-Za-z0-9]/),
      ],
    ],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  createTeacher(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.adminUsers
      .createTeacher({ name: values.name.trim(), email: values.email.trim(), password: values.password })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.form.reset({ name: '', email: '', password: '' });
          this.successMessage.set('Teacher account created. Share the temporary password safely.');
          this.loadUsers();
        },
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  deleteUser(user: AdminUser): void {
    if (user.id === this.currentUser()?.id || this.deletingUserId() !== null) return;
    if (!confirm(`Delete ${user.name} (${user.email}) and all linked bookings, waitlist entries, and training records? This cannot be undone.`)) return;

    this.deletingUserId.set(user.id);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.adminUsers
      .deleteUser(user.id)
      .pipe(finalize(() => this.deletingUserId.set(null)))
      .subscribe({
        next: () => {
          this.users.update((users) => users.filter((item) => item.id !== user.id));
          this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
          this.successMessage.set(`${user.name} and linked history were deleted.`);
        },
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.adminUsers
      .getUsers()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.users.set(response.users);
          this.currentPage.set(Math.min(this.currentPage(), this.totalPages()));
        },
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
