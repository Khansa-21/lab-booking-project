import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../features/auth/auth';

@Component({
  selector: 'app-app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isAdmin = this.auth.isAdmin;
  readonly isStaff = computed(() => {
    const role = this.user()?.role;
    return role === 'TEACHER' || role === 'ADMIN';
  });
  readonly mobileMenuOpen = signal(false);
  readonly loggingOut = signal(false);

  logout(): void {
    if (this.loggingOut()) return;

    this.loggingOut.set(true);
    this.auth
      .logout()
      .pipe(finalize(() => this.loggingOut.set(false)))
      .subscribe({ next: () => void this.router.navigate(['/login']) });
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
