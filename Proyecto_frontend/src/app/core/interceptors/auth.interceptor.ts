import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { RefreshResponse } from '../../shared/interfaces/auth-response.interface';

import {
  catchError,
  throwError,
  switchMap
} from 'rxjs';

const esRutaDeAuth = (url: string) =>
  url.includes('/auth/login') || url.includes('/auth/refresh-token') || url.includes('/auth/logout');

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();

  const request = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401 && !esRutaDeAuth(req.url) && authService.getRefreshToken()) {
        return authService.refreshAccessToken().pipe(
          switchMap((res: RefreshResponse) => {
            authService.updateAccessToken(res.accessToken);

            const reintento = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`
              }
            });

            return next(reintento);
          }),
          catchError((refreshError) => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      if (error.status === 401 && !esRutaDeAuth(req.url)) {
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );

};
