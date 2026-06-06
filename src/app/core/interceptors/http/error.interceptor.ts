import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private route: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        const errorPayload =
          err?.error?.message ||
          err?.error?.err?.message ||
          err?.error ||
          err?.message ||
          err?.statusText ||
          'Error';

        switch (err?.status) {
          case 0:
          case 400:
          case 401:
          // return this.refreshToken(request, next);
          case 403:
          case 405:
          case 406:
          case 408:
          case 409:
          case 412:
            // erreurs fonctionnelles ou auth
            return throwError(() => err?.error ?? errorPayload);

          case 404:
            // erreur de route
            //this.route.navigate([HomeUIRouteUrl.notFound]);
            // this.toastService.handleError(errorPayload);
            return throwError(() => err?.error ?? errorPayload);

          case 500:
            // erreur serveur
            return throwError(() => err ?? errorPayload);

          default:
            // erreur générique
            // this.toastService.handleError(`Error status code: ${err?.status}`);
            return throwError(() => errorPayload);
        }
      }),
    );
  }
}
