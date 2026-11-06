import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../account.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-confirm-email-change',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './confirm-email-change.html',
  styleUrl: './confirm-email-change.scss'
})
export class ConfirmEmailChange implements OnInit {
  state = signal<'loading' | 'success' | 'error'>('loading');

  constructor(private route: ActivatedRoute, private accountService: AccountService, private authService: AuthService) {}

  ngOnInit() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!email || !token) {
      this.state.set('error');
      return;
    }

    this.accountService.confirmEmailChange(email, token).subscribe({
      next: () => this.state.set('success'),
      error: () => this.state.set('error')
    });
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}