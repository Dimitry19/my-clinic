import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

const EXCLUDED_URLS = [
  environment.mobileFeatureUrl, // ou ton env variable pattern
];

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const isExcluded = EXCLUDED_URLS.some((url) => request.url.startsWith(url));

  if (isExcluded) {
    return next(request);
  }

  return next(addAuthToken(request));
};

const addAuthToken = (request: HttpRequest<unknown>): HttpRequest<unknown> =>
  request.clone({ withCredentials: true });
