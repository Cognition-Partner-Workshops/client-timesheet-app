import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  menuItems = [
    { text: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { text: 'Clients', icon: 'business', path: '/clients' },
    { text: 'Work Entries', icon: 'assignment', path: '/work-entries' },
    { text: 'Reports', icon: 'assessment', path: '/reports' }
  ];

  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
