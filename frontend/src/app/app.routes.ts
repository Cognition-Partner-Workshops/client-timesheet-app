import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'clients', 
    loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'work-entries', 
    loadComponent: () => import('./pages/work-entries/work-entries.component').then(m => m.WorkEntriesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./pages/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
