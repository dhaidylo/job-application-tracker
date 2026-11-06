import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-account',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class Account implements OnInit {
  // Profile
  fullName = '';
  email = signal('');
  isLoading = signal(true);
  isSavingProfile = signal(false);
  profileMessage = signal('');
  profileError = signal('');

  // Password
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isSavingPassword = signal(false);
  passwordMessage = signal('');
  passwordError = signal('');

  // Email
  pendingEmail = signal<string | null>(null);
  newEmail = '';
  emailPassword = '';
  isSavingEmail = signal(false);
  emailMessage = signal('');
  emailError = signal('');

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.accountService.getProfile().subscribe({
      next: (profile) => {
        this.fullName = profile.fullName;
        this.email.set(profile.email);
        this.pendingEmail.set(profile.pendingEmail ?? null);
        this.isLoading.set(false);
      },
      error: () => {
        this.profileError.set('Failed to load profile.');
        this.isLoading.set(false);
      }
    });
  }

  onSaveProfile() {
    this.isSavingProfile.set(true);
    this.profileMessage.set('');
    this.profileError.set('');

    this.accountService.updateProfile(this.fullName).subscribe({
      next: () => {
        this.isSavingProfile.set(false);
        this.profileMessage.set('Profile updated.');
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        this.profileError.set(err.error?.message ?? 'Failed to update profile.');
      }
    });
  }

  onChangePassword() {
    this.passwordMessage.set('');
    this.passwordError.set('');

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('New passwords do not match.');
      return;
    }

    this.isSavingPassword.set(true);

    this.accountService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isSavingPassword.set(false);
        this.passwordMessage.set('Password changed.');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.isSavingPassword.set(false);
        this.passwordError.set(err.error?.message ?? 'Failed to change password.');
      }
    });
  }

  onChangeEmail() {
    this.isSavingEmail.set(true);
    this.emailMessage.set('');
    this.emailError.set('');

    this.accountService.changeEmail(this.newEmail, this.emailPassword).subscribe({
      next: (profile) => {
        this.isSavingEmail.set(false);
        this.pendingEmail.set(profile.pendingEmail ?? null);
        this.emailMessage.set('Confirmation link sent to your new address.');
        this.newEmail = '';
        this.emailPassword = '';
      },
      error: (err) => {
        this.isSavingEmail.set(false);
        this.emailError.set(err.error?.message ?? 'Failed to change email.');
      }
    });
  }
}