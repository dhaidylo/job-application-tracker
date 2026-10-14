import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationsService } from '../applications.service';
import { JobApplication, StatusChange, ApplicationStatus } from '../models';

@Component({
  selector: 'app-application-detail',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.scss'
})
export class ApplicationDetail implements OnInit {
  application = signal<JobApplication | null>(null);
  statusChanges = signal<StatusChange[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  constructor(
    private applicationsService: ApplicationsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/applications']);
      return;
    }
    this.loadApplication(id);
    this.loadStatusChanges(id);
  }

  loadApplication(id: string) {
    this.applicationsService.getById(id).subscribe({
      next: (data) => {
        this.application.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load application.');
        this.isLoading.set(false);
      }
    });
  }

  loadStatusChanges(id: string) {
    this.applicationsService.getStatusChanges(id).subscribe({
      next: (data) => this.statusChanges.set(data),
      error: () => {} // non-critical, don't block the page
    });
  }

  getStatusClass(status: ApplicationStatus): string {
    const statusClasses: Record<ApplicationStatus, string> = {
      Applied: 'status-applied',
      Interviewing: 'status-interviewing',
      Offered: 'status-offered',
      Rejected: 'status-rejected',
    };
    return statusClasses[status];
  }

  onEdit() {
    this.router.navigate(['/applications', this.application()!.id, 'edit']);
  }

  onDelete() {
    if (!confirm('Are you sure you want to delete this application?')) return;

    this.applicationsService.delete(this.application()!.id).subscribe({
      next: () => this.router.navigate(['/applications']),
      error: () => this.errorMessage.set('Failed to delete application.')
    });
  }

  onBack() {
    this.router.navigate(['/applications']);
  }
}