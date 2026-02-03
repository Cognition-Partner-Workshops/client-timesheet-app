import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../services/api.service';
import { Client, ClientReport, WorkEntry } from '../../models/api.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  clients: Client[] = [];
  selectedClientId = 0;
  report: ClientReport | null = null;
  isLoading = true;
  reportLoading = false;
  error = '';
  displayedColumns = ['date', 'hours', 'description', 'created'];

  constructor(private apiService: ApiService) {}

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

  onClientChange(): void {
    if (this.selectedClientId > 0) {
      this.loadReport();
    } else {
      this.report = null;
    }
  }

  loadReport(): void {
    this.reportLoading = true;
    this.apiService.getClientReport(this.selectedClientId).subscribe({
      next: (response) => {
        this.report = response;
        this.reportLoading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to load report';
        this.reportLoading = false;
      }
    });
  }

  exportCsv(): void {
    if (!this.selectedClientId) return;

    this.apiService.exportClientReportCsv(this.selectedClientId).subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'csv');
      },
      error: () => {
        this.error = 'Failed to export CSV report';
      }
    });
  }

  exportPdf(): void {
    if (!this.selectedClientId) return;

    this.apiService.exportClientReportPdf(this.selectedClientId).subscribe({
      next: (blob) => {
        this.downloadFile(blob, 'pdf');
      },
      error: () => {
        this.error = 'Failed to export PDF report';
      }
    });
  }

  private downloadFile(blob: Blob, type: 'csv' | 'pdf'): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const client = this.clients.find(c => c.id === this.selectedClientId);
    const clientName = client?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'report';
    const date = new Date().toISOString().split('T')[0];
    a.download = `${clientName}_report_${date}.${type}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  get averageHoursPerEntry(): number {
    if (!this.report || this.report.entryCount === 0) return 0;
    return this.report.totalHours / this.report.entryCount;
  }

  clearError(): void {
    this.error = '';
  }
}
