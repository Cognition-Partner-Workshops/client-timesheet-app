import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoading$.pipe(
    filter(loading => !loading),
    take(1),
    map(() => {
      if (authService.isAuthenticated) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
