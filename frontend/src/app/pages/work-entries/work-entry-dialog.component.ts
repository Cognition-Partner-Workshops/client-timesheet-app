import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Client, WorkEntry } from '../../models/api.models';

interface DialogData {
  entry: WorkEntry | null;
  clients: Client[];
}

@Component({
  selector: 'app-work-entry-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.entry ? 'Edit Work Entry' : 'Add New Work Entry' }}</h2>
    <mat-dialog-content>
      <form>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Client</mat-label>
          <mat-select [(ngModel)]="formData.clientId" name="clientId" required>
            <mat-option *ngFor="let client of data.clients" [value]="client.id">
              {{ client.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Hours</mat-label>
          <input matInput type="number" [(ngModel)]="formData.hours" name="hours" required min="0.01" max="24" step="0.01">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" [(ngModel)]="formData.date" name="date" required>
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="formData.description" name="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!isValid()">
        {{ data.entry ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
    mat-dialog-content {
      min-width: 400px;
    }
  `]
})
export class WorkEntryDialogComponent {
  formData: {
    clientId: number;
    hours: number | string;
    description: string;
    date: Date;
  } = {
    clientId: 0,
    hours: '',
    description: '',
    date: new Date()
  };

  constructor(
    public dialogRef: MatDialogRef<WorkEntryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.entry) {
      this.formData = {
        clientId: data.entry.client_id,
        hours: data.entry.hours,
        description: data.entry.description || '',
        date: new Date(data.entry.date)
      };
    }
  }

  isValid(): boolean {
    const hours = typeof this.formData.hours === 'string' 
      ? parseFloat(this.formData.hours) 
      : this.formData.hours;
    return this.formData.clientId > 0 && hours > 0 && hours <= 24 && !!this.formData.date;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isValid()) {
      const hours = typeof this.formData.hours === 'string' 
        ? parseFloat(this.formData.hours) 
        : this.formData.hours;
      this.dialogRef.close({
        clientId: this.formData.clientId,
        hours: hours,
        description: this.formData.description || undefined,
        date: this.formData.date.toISOString().split('T')[0]
      });
    }
  }
}
