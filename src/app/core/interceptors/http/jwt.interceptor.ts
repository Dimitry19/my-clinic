import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { includeBearerTokenInterceptor } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(Keycloak);
  const token = keycloak.token;

  if (!token) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};

export const bearerInterceptor: HttpInterceptorFn = (req, next) =>
  isPlatformBrowser(inject(PLATFORM_ID))
    ? includeBearerTokenInterceptor(req, next)
    : next(req);
