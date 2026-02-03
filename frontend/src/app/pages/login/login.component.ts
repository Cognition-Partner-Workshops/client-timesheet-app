import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  error = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email) return;
    
    this.error = '';
    this.isLoading = true;

    this.authService.login(this.email).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.error?.error || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
