import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HeaderService } from '../headers.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';

import Keycloak from 'keycloak-js';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthUser } from '../../models/auth/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends HeaderService {
  private platformId = inject(PLATFORM_ID);

  private readonly document = inject(DOCUMENT);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL, {
    optional: true,
  });
  private readonly keycloak = inject(Keycloak, { optional: true });
  private readonly _authenticated = signal(false);
  private readonly _tokenVersion = signal(0);
  readonly isAuthenticated = this._authenticated.asReadonly();

  keycloakStatus: string | undefined;

  private readonly _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  private readonly _ready = signal(false);

  constructor() {
    super();

    /*  if (!this.keycloak) this._ready.set(true);

    effect(() => {
      const ev = this.keycloakSignal?.();
      if (!ev) return;

      switch (ev.type) {
        case KeycloakEventType.Ready:
          this._authenticated.set(typeEventArgs<ReadyArgs>(ev.args));
          this._tokenVersion.update((v) => v + 1);
          break;

        case KeycloakEventType.AuthSuccess:
        case KeycloakEventType.AuthRefreshSuccess:
          this._authenticated.set(true);
          this._tokenVersion.update((v) => v + 1);
          break;

        case KeycloakEventType.AuthLogout:
        case KeycloakEventType.AuthRefreshError:
          this._authenticated.set(false);
          this._tokenVersion.update((v) => v + 1);
          break;

        case KeycloakEventType.AuthError:
          // Débloque le guard même si l'init échoue (ex. l'erreur CORS d'avant)
          this._ready.set(true);
          break;
      }
    }); */
  }

  loginKeycloak(redirectUri?: string): Promise<void> {
    console.log('LOGIN KEYCLOAK', {
      redirectUri: redirectUri ?? this.document.location.origin,
    });
    if (!this.keycloak) return Promise.resolve();

    return this.keycloak.login({
      redirectUri: redirectUri ?? this.document.location.origin,
    });
  }
  logout() {
    if (!this.keycloak) return;

    this.keycloak.logout({
      redirectUri: `${environment.frontendUrl}/login`,
    });
  }

  hasRole(required: string[]): boolean {
    const roles = this.currentUser()?.roles ?? [];
    return required.some((r) => roles.includes(r));
  }

  async whenReady(): Promise<void> {
    if (this._ready()) return;
    await firstValueFrom(toObservable(this._ready).pipe(filter((r) => r)));
  }

  readonly userLabel = computed(() =>
    this.currentUser()?.roles.includes('MEDECIN') ? 'Dr.' : 'M.',
  );

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  setAuthenticatedValue(newValue: boolean) {
    this._authenticated.set(newValue);
  }

  setCurrentUser(newValue: AuthUser | null) {
    this._currentUser.set(newValue);
  }
  setReadyValue(newValue: boolean) {
    this._ready.set(newValue);
  }

  updateTokenVersionValue() {
    this._tokenVersion.update((newValue) => newValue + 1);
  }
}
