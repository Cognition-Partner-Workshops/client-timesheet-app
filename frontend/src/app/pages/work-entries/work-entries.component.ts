import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';
import { Client, WorkEntry } from '../../models/api.models';
import { WorkEntryDialogComponent } from './work-entry-dialog.component';

@Component({
  selector: 'app-work-entries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './work-entries.component.html',
  styleUrls: ['./work-entries.component.scss']
})
export class WorkEntriesComponent implements OnInit {
  workEntries: WorkEntry[] = [];
  clients: Client[] = [];
  isLoading = true;
  error = '';
  displayedColumns = ['client', 'date', 'hours', 'description', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    this.apiService.getClients().subscribe({
      next: (response) => {
        this.clients = response.clients || [];
      },
      error: (err) => console.error('Failed to load clients:', err)
    });

    this.apiService.getWorkEntries().subscribe({
      next: (response) => {
        this.workEntries = response.workEntries || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load work entries';
        this.isLoading = false;
      }
    });
  }

  openDialog(entry?: WorkEntry): void {
    const dialogRef = this.dialog.open(WorkEntryDialogComponent, {
      width: '500px',
      data: { entry: entry ? { ...entry } : null, clients: this.clients }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (entry) {
          this.updateEntry(entry.id, result);
        } else {
          this.createEntry(result);
        }
      }
    });
  }

  createEntry(data: { clientId: number; hours: number; description?: string; date: string }): void {
    this.apiService.createWorkEntry(data).subscribe({
      next: () => this.loadData(),
      error: (err) => this.error = err.error?.error || 'Failed to create work entry'
    });
  }

  updateEntry(id: number, data: { clientId?: number; hours?: number; description?: string; date?: string }): void {
    this.apiService.updateWorkEntry(id, data).subscribe({
      next: () => this.loadData(),
      error: (err) => this.error = err.error?.error || 'Failed to update work entry'
    });
  }

  deleteEntry(entry: WorkEntry): void {
    if (confirm(`Are you sure you want to delete this ${entry.hours} hour entry for ${entry.client_name}?`)) {
      this.apiService.deleteWorkEntry(entry.id).subscribe({
        next: () => this.loadData(),
        error: (err) => this.error = err.error?.error || 'Failed to delete work entry'
      });
    }
  }

  clearError(): void {
    this.error = '';
  }
}
