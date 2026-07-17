import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';
import { AuthService }
  from '../services/auth.service';
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  /* 
  ¿Existe sesión? 
  */
  if (authService.isAuthenticated()) {
    return true;
  }
  /* 
  No autenticado 
  */
  router.navigate([
    '/login'
  ]);

  return false;
}; 
