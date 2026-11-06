import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ChangePasswordRequest, Profile } from './models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly apiUrl = `${environment.apiUrl}/account`;

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get<Profile>(this.apiUrl);
  }

  updateProfile(fullName: string) {
    return this.http.put<Profile>(`${this.apiUrl}/profile`, { fullName });
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.put<void>(`${this.apiUrl}/password`, request);
  }

  changeEmail(newEmail: string, currentPassword: string) {
    return this.http.put<Profile>(`${this.apiUrl}/email`, { newEmail, currentPassword });
  }

  confirmEmailChange(email: string, token: string) {
    return this.http.post(`${this.apiUrl}/confirm-email-change`, { email, token });
  }
}