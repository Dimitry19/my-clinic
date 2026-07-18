import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      const normalizedError = new HttpErrorResponse({
        error: err.error?.message ?? { message: 'Unknown error' },
        status: err.status,
        statusText: err.statusText,
        url: err.url ?? undefined,
      });

      // optionnel : logging global
      console.log('HTTP Error:', normalizedError);

      return throwError(() => normalizedError);
    }),
  );
};
