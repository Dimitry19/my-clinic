import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  typeEventArgs,
  ReadyArgs,
} from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { AuthUser } from '../../../core/models/auth/auth.model';

@Component({
  selector: 'clnt-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  currentYear = new Date().getFullYear();

  private readonly authService = inject(AuthService);
  private keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  constructor() {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authService.setAuthenticatedValue(
          typeEventArgs<ReadyArgs>(keycloakEvent.args),
        );
        console.log(
          '[login] authenticated =',
          this.authService.isAuthenticated(),
        );
      }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authService.setAuthenticatedValue(false);
        console.log(
          '[login] authenticated =',
          this.authService.isAuthenticated(),
        );
      }
    });
  }

  onLogin() {
    this.loading.set(true);
    this.errorMsg.set(null);
    try {
      this.keycloak.login(); //
    } catch {
      this.loading.set(false);
      this.errorMsg.set(
        "Impossible de contacter le serveur d'authentification.",
      );
    }
  }
}
