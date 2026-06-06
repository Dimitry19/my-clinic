import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.prod';
import { HeaderService } from '../headers.service';
import { CommonService } from '../common.services';
import { Authenticate, User } from '../../models/auth/auth.model';
import { isPlatformBrowser } from '@angular/common';
import { ApiResponse } from '../../models/response/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends HeaderService {
  private platformId = inject(PLATFORM_ID);
  private commonService = inject(CommonService);
  private http = inject(HttpClient);
  private authUrl = environment.authUrl;

  public currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isAuth = computed(() => !!this.currentUser());

  constructor() {
    super();
    // Hydratation depuis localStorage uniquement côté browser
    this.loadUserFromStorage();
  }

  login(credentials: Authenticate): Observable<ApiResponse<User>> {
    return this.http
      .post<ApiResponse<User>>(`${this.authUrl}/authenticate`, credentials)
      .pipe(catchError(this.commonService.globalErrorHandler));
  }

  logout(): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(`${this.authUrl}/logout`, {
        headers: this.headersTextPlain,
      })
      .pipe(tap((response) => {}));
  }

  refreshToken(): Observable<ApiResponse<void>> {
    return this.http
      .post<ApiResponse<void>>(`${this.authUrl}/refresh`, {})
      .pipe(tap((response) => {}));
  }

  hasRole(requiredRoles: string[]): boolean {
    const user = this.user();
    if (!user || !user.role) {
      return false;
    }
    return requiredRoles.some((role) => user.role.includes(role));
  }

  setUser(user: User | null): void {
    this.currentUser.set(user);

    if (!this.isBrowser()) return;

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  clearUser(): void {
    this.setUser(null);
  }

  loadUserFromStorage(): void {
    if (!this.isBrowser()) return;

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser.set(JSON.parse(stored));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
