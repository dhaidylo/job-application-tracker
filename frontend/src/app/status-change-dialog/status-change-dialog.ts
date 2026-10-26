import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApplicationStatus, APPLICATION_STATUSES } from '../models';

export interface StatusDialogData {
  currentStatus: ApplicationStatus;
}

@Component({
  selector: 'app-status-change-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './status-change-dialog.html',
  styleUrl: './status-change-dialog.scss'
})
export class StatusChangeDialog {
  newStatus: ApplicationStatus;
  note = '';

  statuses: ApplicationStatus[] = APPLICATION_STATUSES;

  constructor(
    private dialogRef: MatDialogRef<StatusChangeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: StatusDialogData
  ) {
    // Pre-select current status
    this.newStatus = data.currentStatus;
  }

  onSave() {
    this.dialogRef.close({ newStatus: this.newStatus, note: this.note || undefined });
  }

  onCancel() {
    this.dialogRef.close();
  }
}