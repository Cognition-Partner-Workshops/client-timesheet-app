import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Client } from '../../models/api.models';

@Component({
  selector: 'app-client-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Client' : 'Add New Client' }}</h2>
    <mat-dialog-content>
      <form>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Client Name</mat-label>
          <input matInput [(ngModel)]="formData.name" name="name" required>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput [(ngModel)]="formData.description" name="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!formData.name">
        {{ data ? 'Update' : 'Create' }}
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
export class ClientDialogComponent {
  formData = {
    name: '',
    description: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ClientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Client | null
  ) {
    if (data) {
      this.formData = {
        name: data.name,
        description: data.description || ''
      };
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.formData.name) {
      this.dialogRef.close({
        name: this.formData.name,
        description: this.formData.description || undefined
      });
    }
  }
}
