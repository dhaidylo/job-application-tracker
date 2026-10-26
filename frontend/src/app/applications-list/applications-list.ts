import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { ApplicationsService } from '../applications.service';
import { AuthService } from '../auth.service';
import { JobApplication, ApplicationStatus, ApplicationSource, UpdateStatusRequest, APPLICATION_SOURCES, APPLICATION_STATUSES } from '../models';
import { StatusChangeDialog } from '../status-change-dialog/status-change-dialog';


type SortField = 'appliedDate' | 'companyName';
type SortDirection = 'asc' | 'desc';
type StatusFilter = ApplicationStatus | 'All';
type SourceFilter = ApplicationSource | 'All';

@Component({
  selector: 'app-applications-list',
  imports: [
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './applications-list.html',
  styleUrl: './applications-list.scss'
})
export class ApplicationsList implements OnInit {
  applications = signal<JobApplication[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Filter signals
  searchQuery = signal('');
  selectedStatus = signal<StatusFilter>('All');
  selectedSource = signal<SourceFilter>('All');

  // Sort signals
  sortField = signal<SortField>('appliedDate');
  sortDirection = signal<SortDirection>('desc');

  statuses: StatusFilter[] = ['All', ...APPLICATION_STATUSES];
  sources: SourceFilter[] = ['All',...APPLICATION_SOURCES];

  // Derived signal — automatically filters whenever applications or searchQuery changes
  filteredApplications = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const source = this.selectedSource();
    const field = this.sortField();
    const direction = this.sortDirection();

    let result = this.applications();

    // Filter by search query
    if (query) {
      result = result.filter(app =>
        app.companyName.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query) ||
        app.location.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (status !== 'All') {
      result = result.filter(app => app.status === status);
    }

    // Filter by source
    if (source !== 'All') {
      result = result.filter(app => app.source === source);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;

      if (field === 'appliedDate') {
        comparison = new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
      } else if (field === 'companyName') {
        comparison = a.companyName.localeCompare(b.companyName);
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return result;
  });

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

  onSearch(query: string) {
    this.searchQuery.set(query);
  }

  onStatusFilter(status: StatusFilter) {
    this.selectedStatus.set(status);
  }

  onSourceFilter(source: SourceFilter) {
    this.selectedSource.set(source);
  }

  onSort(field: SortField) {
    if (this.sortField() === field) {
      // Toggle direction if same field clicked
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  onClearFilters() {
    this.searchQuery.set('');
    this.selectedStatus.set('All');
    this.selectedSource.set('All');
  }

  // Returns true if any filter is active
  hasActiveFilters = computed(() => {
    return this.searchQuery().trim() !== '' || this.selectedStatus() !== 'All' || this.selectedSource() !== 'All';
  });

  getSortIcon(field: SortField): string {
    if (this.sortField() !== field) return 'unfold_more';
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
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