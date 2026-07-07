import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { ApplicationsList } from './applications-list/applications-list';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'applications',
    component: ApplicationsList,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];