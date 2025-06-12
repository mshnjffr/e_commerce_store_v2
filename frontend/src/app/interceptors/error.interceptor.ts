import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Don't handle 401 errors for login/register requests
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

      switch (error.status) {
        case 401:
          if (!isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.navigate(['/auth']);
            errorMessage = 'Session expired. Please login again.';
          }
          // For auth requests, let the component handle the error
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
      }

      // Only show notification if it's not an auth request with 401 error
      if (!(isAuthRequest && error.status === 401)) {
        notificationService.showError(errorMessage);
      }
      
      return throwError(() => error);
    })
  );
};
