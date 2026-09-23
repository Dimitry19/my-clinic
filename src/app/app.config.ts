import {
  ApplicationConfig,
  provideZoneChangeDetection,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { TrinityPrimeTheme } from './core/themes/trinity-prime.theme';
import { errorInterceptor } from './core/interceptors/http/error.interceptor';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ConfirmationService } from 'primeng/api';
import {
  AutoRefreshTokenService,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular';
import { provideKeycloakSSR } from './core/keycloak/provide-keycloak-ssr';
import { environment } from '../environments/environment';
import { jwtInterceptor } from './core/interceptors/http/jwt.interceptor';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloakSSR({
      config: {
        realm: environment.keycloakRealm,
        url: environment.keycloakUrl,
        clientId: environment.keycloakClient,
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${environment.frontendUrl}/silent-check-sso.html`,
        redirectUri: `${environment.frontendUrl}/agenda`,
      },
      features: [
        withAutoRefreshToken({
          onInactivityTimeout: 'logout',
          sessionTimeout: 60000,
        }),
      ],
      providers: [
        AutoRefreshTokenService,
        UserActivityService,
        {
          provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
          useValue: [{ urlPattern: /^\/api(\/.*)?$/i }],
        },
      ],
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        includeBearerTokenInterceptor,
        jwtInterceptor,
        errorInterceptor,
      ]),
      withFetch(),
    ),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    ConfirmationService,
    providePrimeNG({
      theme: {
        preset: TrinityPrimeTheme,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
      ripple: true,
    }),
    {
      provide: LOCALE_ID,
      useValue: 'fr',
    },
  ],
};
