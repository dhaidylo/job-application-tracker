import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ApplicationsService } from '../applications.service';
import { AuthService } from '../auth.service';
import { JobApplication, ApplicationStatus, UpdateStatusRequest } from '../models';
import { StatusChangeDialog } from '../status-change-dialog/status-change-dialog';

@Component({
  selector: 'app-applications-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
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
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading.set(true);
    this.applicationsService.getAll().subscribe({
      next: (data) => {
        this.applications.set(data.jobApplications);
        this.errorMessage.set(null);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load applications.');
        this.isLoading.set(false);
      }
    });
  }

  // Map of status to CSS class for styling
  getStatusClass(status: ApplicationStatus): string {
    const statusClasses: Record<ApplicationStatus, string> = {
      Applied: 'status-applied',
      Interviewing: 'status-interviewing',
      Offered: 'status-offered',
      Rejected: 'status-rejected',
    };
    return statusClasses[status];
  }

  onStatusClick(app: JobApplication) {
    const dialogRef = this.dialog.open(StatusChangeDialog, {
      data: { currentStatus: app.status }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const request: UpdateStatusRequest = {
        newStatus: result.newStatus,
        note: result.note
      };

      this.applicationsService.updateStatus(app.id, request).subscribe({
        next: () => {
          this.applications.update(apps =>
            apps.map(a => a.id === app.id ? { ...a, status: result.newStatus } : a)
          );
        },
        error: () => {
          this.errorMessage.set('Failed to update status.');
        }
      });
    });
  }

  onRowClick(app: JobApplication) {
    this.router.navigate(['/applications', app.id]);
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