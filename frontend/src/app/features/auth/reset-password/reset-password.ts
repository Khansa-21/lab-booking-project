import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService, getApiErrorMessage } from '../auth';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly pending = signal(false);
  readonly errorMessage = signal('');
  readonly showPassword = signal(false);
  readonly showConfirmation = signal(false);
  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';
  readonly form = this.formBuilder.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    confirmPassword: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.pending() || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.controls.password.value !== this.form.controls.confirmPassword.value) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.pending.set(true);
    this.errorMessage.set('');
    this.auth
      .resetPassword({ token: this.token, password: this.form.controls.password.value })
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/login'], { queryParams: { reset: 'success' } }),
        error: (error) => this.errorMessage.set(getApiErrorMessage(error)),
      });
  }
}
