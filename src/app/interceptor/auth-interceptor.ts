import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/app/security/services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const publicUrls = [
    '/api/auth/login/password',
    '/api/auth/login/pin',
    '/api/auth/refresh-token'
  ];

  if (publicUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  const token = authService.getAccessToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {

        // Attempt refresh
        return authService.refreshToken().pipe(
          switchMap(response => {
            const newToken = response.accessToken;

            authReq = authReq.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            return next(authReq);
          }),
          catchError(() => {
            authService.logout().subscribe();
            router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
