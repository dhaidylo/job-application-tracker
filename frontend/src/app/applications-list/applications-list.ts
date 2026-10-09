import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { DatePipe } from '@angular/common';
import { ApplicationsService } from '../applications.service';
import { AuthService } from '../auth.service';
import { JobApplication, ApplicationStatus } from '../models';

@Component({
  selector: 'app-applications-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    DatePipe
  ],
  templateUrl: './applications-list.html',
  styleUrl: './applications-list.scss'
})
export class ApplicationsList implements OnInit {
  applications = signal<JobApplication[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Columns to display in the table
  displayedColumns = ['companyName', 'position', 'status', 'source', 'appliedDate', 'actions'];

  constructor(
    private applicationsService: ApplicationsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading.set(true);
    this.applicationsService.getAll().subscribe({
      next: (data) => {
        this.applications = data;
        this.errorMessage.set(null);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load applications.');
        this.isLoading.set(false);
      }
    });
  }

  // Returns a Material color for each status chip
  getStatusColor(status: ApplicationStatus): string {
    const colors: Record<ApplicationStatus, string> = {
      Applied: 'primary',
      Interviewing: 'accent',
      Offered: 'primary',
      Rejected: 'warn',
    };
    return colors[status];
  }

  onAdd() {
    this.router.navigate(['/applications/new']);
  }

  onEdit(id: string) {
    this.router.navigate(['/applications', id, 'edit']);
  }

  onDelete(id: string) {
    if (!confirm('Are you sure you want to delete this application?')) return;

    this.applicationsService.delete(id).subscribe({
      next: () => {
        this.applications.update(applications =>
          applications.filter(a => a.id !== id)
        );
      },
      error: () => {
        this.errorMessage.set('Failed to delete application.');
      }
    });
  }

  onLogout() {
    this.authService.logout();
  }
}