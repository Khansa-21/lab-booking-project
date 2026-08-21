import { Routes } from '@angular/router';

import { authGuard } from './features/auth/auth-guard';
import { adminGuard } from './features/auth/admin-guard';
import { staffGuard } from './features/auth/staff-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((module) => module.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((module) => module.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup').then((module) => module.Signup),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then(
        (module) => module.ForgotPassword,
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password').then(
        (module) => module.ResetPassword,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((module) => module.Dashboard),
  },
  {
    path: 'equipment',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/equipment/equipment-list/equipment-list').then(
        (module) => module.EquipmentList,
      ),
  },
  {
    path: 'equipment/:id/book',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/reservation-form/reservation-form').then(
        (module) => module.ReservationForm,
      ),
  },
  {
    path: 'equipment/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/equipment/equipment-detail/equipment-detail').then(
        (module) => module.EquipmentDetail,
      ),
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/my-reservations/my-reservations').then(
        (module) => module.MyReservations,
      ),
  },
  {
    path: 'waitlist',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/waitlist/my-waitlist/my-waitlist').then(
        (module) => module.MyWaitlist,
      ),
  },
  {
    path: 'admin/resources',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/resource-management/resource-management').then(
        (module) => module.ResourceManagement,
      ),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/user-management/user-management').then(
        (module) => module.UserManagement,
      ),
  },
  {
    path: 'admin/training',
    canActivate: [authGuard, staffGuard],
    loadComponent: () =>
      import('./features/admin/training-management/training-management').then(
        (module) => module.TrainingManagement,
      ),
  },
  {
    path: 'eligibility',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/eligibility/my-eligibility/my-eligibility').then(
        (module) => module.MyEligibility,
      ),
  },
  {
    path: 'check-in/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/check-in/check-in-page/check-in-page').then((module) => module.CheckInPage),
  },
  {
    path: 'admin/check-ins',
    canActivate: [authGuard, staffGuard],
    loadComponent: () =>
      import('./features/admin/check-in-management/check-in-management').then(
        (module) => module.CheckInManagement,
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-dashboard/admin-dashboard').then(
        (module) => module.AdminDashboard,
      ),
  },
  {
    path: 'admin/approvals',
    canActivate: [authGuard, staffGuard],
    loadComponent: () =>
      import('./features/admin/reservation-approvals/reservation-approvals').then(
        (module) => module.ReservationApprovals,
      ),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized').then(
        (module) => module.Unauthorized,
      ),
  },
  { path: '**', redirectTo: '' },
];
