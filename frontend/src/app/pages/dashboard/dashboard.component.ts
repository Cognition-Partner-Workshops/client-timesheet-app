import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { Client, WorkEntry } from '../../models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  clients: Client[] = [];
  workEntries: WorkEntry[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    private router: Router
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
        console.error('Failed to load work entries:', err);
        this.isLoading = false;
      }
    });
  }

  get totalHours(): number {
    return this.workEntries.reduce((sum, entry) => sum + entry.hours, 0);
  }

  get recentEntries(): WorkEntry[] {
    return this.workEntries.slice(0, 5);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
