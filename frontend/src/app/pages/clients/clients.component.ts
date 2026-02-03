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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService } from '../../services/api.service';
import { Client } from '../../models/api.models';
import { ClientDialogComponent } from './client-dialog.component';

@Component({
  selector: 'app-clients',
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
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  isLoading = true;
  error = '';
  displayedColumns = ['name', 'description', 'created', 'actions'];

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.apiService.getClients().subscribe({
      next: (response) => {
        this.clients = response.clients || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load clients';
        this.isLoading = false;
      }
    });
  }

  openDialog(client?: Client): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '500px',
      data: client ? { ...client } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (client) {
          this.updateClient(client.id, result);
        } else {
          this.createClient(result);
        }
      }
    });
  }

  createClient(data: { name: string; description?: string }): void {
    this.apiService.createClient(data).subscribe({
      next: () => this.loadClients(),
      error: (err) => this.error = err.error?.error || 'Failed to create client'
    });
  }

  updateClient(id: number, data: { name?: string; description?: string }): void {
    this.apiService.updateClient(id, data).subscribe({
      next: () => this.loadClients(),
      error: (err) => this.error = err.error?.error || 'Failed to update client'
    });
  }

  deleteClient(client: Client): void {
    if (confirm(`Are you sure you want to delete "${client.name}"?`)) {
      this.apiService.deleteClient(client.id).subscribe({
        next: () => this.loadClients(),
        error: (err) => this.error = err.error?.error || 'Failed to delete client'
      });
    }
  }

  clearError(): void {
    this.error = '';
  }
}
