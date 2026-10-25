import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../auth/auth';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    void this.auth.restoreSession().then(() => {
      if (this.auth.isAuthenticated()) {
        void this.router.navigateByUrl(this.auth.isAdmin() ? '/admin' : '/dashboard');
      }
    });
  }
}
