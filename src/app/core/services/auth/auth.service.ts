import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { HeaderService } from '../headers.service';
import { Authenticate, User } from '../../models/auth/auth.model';
import { isPlatformBrowser } from '@angular/common';
import { ApiResponse } from '../../models/response/api-response.model';
import { ErrorService } from '../error.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends HeaderService {
  private platformId = inject(PLATFORM_ID);
  private errorService = inject(ErrorService);
  private http = inject(HttpClient);
  private readonly authUrl = environment.authUrl;

  private readonly _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuth = computed(() => !!this.currentUser());

  constructor() {
    super();
    // Hydratation depuis localStorage uniquement côté browser
    this.loadUserFromStorage();
  }

  login(credentials: Authenticate): Observable<ApiResponse<User>> {
    return this.http
      .post<ApiResponse<User>>(`${this.authUrl}/authenticate`, credentials)
      .pipe(catchError(this.errorService.globalStatusErrorHandler));
  }

  logout(): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(`${this.authUrl}/logout`, {
        headers: this.headersTextPlain,
      })
      .pipe(catchError(this.errorService.globalStatusErrorHandler));
  }

  refreshToken() {
    return this.http
      .post<ApiResponse<void>>(`${this.authUrl}/refresh`, {})
      .pipe(
        map((r) => r.data),
        catchError((e) => this.errorService.globalStatusErrorHandler(e)),
      );
  }

  setCurrentUser(user: User | null): void {
    this._currentUser.set(user);

    if (!this.isBrowser()) return;

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  clearUser(): void {
    this.setCurrentUser(null);
  }

  userLabel(): string {
    return this.currentUser()?.role === 'MEDECIN' ? 'Dr.' : 'M.';
  }

  loadUserFromStorage(): void {
    if (!this.isBrowser()) return;

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.setCurrentUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
