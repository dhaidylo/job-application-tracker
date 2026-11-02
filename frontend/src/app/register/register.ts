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
  selector: 'app-register',
  imports: [
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  fullName = '';
  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = '';
  isRegistered = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage = '';

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isRegistered.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage = err.status === 409
          ? 'An account with this email already exists.'
          : 'Something went wrong. Please try again.';
      }
    });
  }
}