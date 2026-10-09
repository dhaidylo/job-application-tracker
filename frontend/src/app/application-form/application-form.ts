import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApplicationsService } from '../applications.service';
import { ApplicationSource, ApplicationStatus } from '../models';

@Component({
  selector: 'app-application-form',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss'
})
export class ApplicationForm implements OnInit {
  // Form fields
  companyName = '';
  position = '';
  location = '';
  status: ApplicationStatus = 'Applied';
  source: ApplicationSource = 'Unknown';
  appliedDate: Date = new Date();
  jobPostingUrl = '';
  notes = '';

  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');

  // If editId is set, we're in edit mode; otherwise create mode
  editId: string | null = null;

  // All possible statuses and sources for the dropdowns
  statuses: ApplicationStatus[] = [
    'Applied',
    'Interviewing',
    'Offered',
    'Rejected'
  ];

  sources: ApplicationSource[] = [
    'Unknown',
    'Arbeitsagentur',
    'LinkedIn',
    'Indeed',
    'Xing',
    'Stepstone',
    'Referral',
    'Recruiter',
    'CompanyWebsite',
    'CarreerFair',
    'Other',
  ];

  constructor(
    private applicationsService: ApplicationsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Check if there's an id in the route — if so, load the existing application
    this.editId = this.route.snapshot.paramMap.get('id');
    if (this.editId) {
      this.loadApplication(this.editId);
    }
  }

  loadApplication(id: string) {
    this.isLoading.set(true);
    this.applicationsService.getById(id).subscribe({
      next: (app) => {
        this.companyName = app.companyName;
        this.position = app.position;
        this.location = app.location;
        this.status = app.status;
        this.source = app.source;
        this.appliedDate = new Date(app.appliedDate);
        this.jobPostingUrl = app.jobPostingUrl ?? '';
        this.notes = app.notes ?? '';
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load application.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit() {
    this.isSaving.set(true);
    this.errorMessage.set('');

    const payload = {
      companyName: this.companyName,
      position: this.position,
      location: this.location,
      status: this.status,
      source: this.source,
      appliedDate: this.appliedDate.toISOString(),
      jobPostingUrl: this.jobPostingUrl || null,
      notes: this.notes || null
    };

    const request = this.editId
      ? this.applicationsService.update(this.editId, payload)
      : this.applicationsService.create(payload);

    request.subscribe({
      next: () => {
        this.router.navigate(['/applications']);
      },
      error: () => {
        this.errorMessage.set('Failed to save application.');
        this.isSaving.set(false);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/applications']);
  }

  get pageTitle() {
    return this.editId ? 'Edit Application' : 'Add Application';
  }
}