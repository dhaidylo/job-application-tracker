import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Prevents logged-in users from accessing auth pages (login, register)
// Redirects them to applications if they already have a token
export const loggedInGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    router.navigate(['/applications']);
    return false;
  }

  return true;
};