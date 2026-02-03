import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  user$ = this.userSubject.asObservable();
  isLoading$ = this.loadingSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.checkAuth();
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  private checkAuth(): void {
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedEmail) {
      this.apiService.getCurrentUser().pipe(
        tap(response => {
          this.userSubject.next(response.user);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          console.error('Auth check failed:', error);
          localStorage.removeItem('userEmail');
          this.userSubject.next(null);
          this.loadingSubject.next(false);
          return of(null);
        })
      ).subscribe();
    } else {
      this.loadingSubject.next(false);
    }
  }

  login(email: string): Observable<any> {
    return this.apiService.login(email).pipe(
      tap(response => {
        this.userSubject.next(response.user);
        localStorage.setItem('userEmail', email);
      })
    );
  }

  logout(): void {
    this.userSubject.next(null);
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }
}
