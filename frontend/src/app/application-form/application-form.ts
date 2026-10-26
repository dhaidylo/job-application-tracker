import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApplicationsService } from '../applications.service';
import { ApplicationSource, ApplicationStatus, APPLICATION_STATUSES, APPLICATION_SOURCES } from '../models';

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

  editId: string | null = null;

  statuses: ApplicationStatus[] = APPLICATION_STATUSES;

  sources: ApplicationSource[] = APPLICATION_SOURCES;

  constructor(
    private applicationsService: ApplicationsService,
    private route: ActivatedRoute,
    private navigationLocation: Location
  ) {}

  ngOnInit() {
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
        // Go back to wherever the user came from — list or detail page
        this.navigationLocation.back();
      },
      error: () => {
        this.errorMessage.set('Failed to save application.');
        this.isSaving.set(false);
      }
    });
  }

  onCancel() {
    // Go back to wherever the user came from
    this.navigationLocation.back();
  }

  get pageTitle() {
    return this.editId ? 'Edit Application' : 'Add Application';
  }
}