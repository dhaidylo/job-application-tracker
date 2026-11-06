import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ApplicationsList } from './applications-list/applications-list';
import { ApplicationDetail } from './application-detail/application-detail';
import { ApplicationForm } from './application-form/application-form';
import { Dashboard } from './dashboard/dashboard';
import { Account } from './account/account';
import { authGuard } from './auth-guard';
import { loggedInGuard } from './logged-in.guard';
import { ConfirmEmail } from './confirm-email/confirm-email';
import { ConfirmEmailChange } from './confirm-email-change/confirm-email-change';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [loggedInGuard] },
  { path: 'register', component: Register, canActivate: [loggedInGuard] },
  { path: 'confirm-email', component: ConfirmEmail },
  { path: 'confirm-email-change', component: ConfirmEmailChange },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'applications', component: ApplicationsList, canActivate: [authGuard] },
  { path: 'applications/new', component: ApplicationForm, canActivate: [authGuard] },
  { path: 'applications/:id', component: ApplicationDetail, canActivate: [authGuard] },
  { path: 'applications/:id/edit', component: ApplicationForm, canActivate: [authGuard] },
  { path: 'account', component: Account, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];