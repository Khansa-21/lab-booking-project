import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth';

export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.user()?.role;

  return role === 'TEACHER' || role === 'ADMIN'
    ? true
    : router.createUrlTree(['/unauthorized']);
};
