import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');
  needsConfirmation = signal(false);
  resendSent = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

onSubmit() {
  this.isLoading.set(true);
  this.errorMessage.set('');
  this.needsConfirmation.set(false);
  this.resendSent.set(false);

  this.authService.login({ email: this.email, password: this.password }).subscribe({
    next: () => {
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      this.isLoading.set(false);

      if (err.status === 403) {
        // The email isn't confirmed yet
        this.needsConfirmation.set(true);
        this.errorMessage.set('Please confirm your email before signing in.');
      } else if (err.status === 401) {
        // Generic message, don't reveal which field is wrong
        this.errorMessage.set('Invalid email or password.');
      } else {
        this.errorMessage.set('Something went wrong. Please try again.');
      }
    }
  });
}

  onResend() {
    this.authService.resendConfirmation(this.email).subscribe(() => this.resendSent.set(true));
  }
}