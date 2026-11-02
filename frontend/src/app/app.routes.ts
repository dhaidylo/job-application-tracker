import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ApplicationsList } from './applications-list/applications-list';
import { ApplicationDetail } from './application-detail/application-detail';
import { ApplicationForm } from './application-form/application-form';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth-guard';
import { loggedInGuard } from './logged-in.guard';
import { ConfirmEmail } from './confirm-email/confirm-email';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [loggedInGuard] },
  { path: 'register', component: Register, canActivate: [loggedInGuard] },
  { path: 'confirm-email', component: ConfirmEmail },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'applications', component: ApplicationsList, canActivate: [authGuard] },
  { path: 'applications/new', component: ApplicationForm, canActivate: [authGuard] },
  { path: 'applications/:id', component: ApplicationDetail, canActivate: [authGuard] },
  { path: 'applications/:id/edit', component: ApplicationForm, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];