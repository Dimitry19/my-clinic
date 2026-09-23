import {
  provideKeycloak,
  createInterceptorCondition,
  withAutoRefreshToken,
  AutoRefreshTokenService,
  UserActivityService,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
} from 'keycloak-angular';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  PLATFORM_ID,
  makeEnvironmentProviders,
} from '@angular/core';

export const localhostCondition =
  createInterceptorCondition<IncludeBearerTokenCondition>({
    urlPattern: /^\/api(\/.*)?$/i,
  });

export const provideKeycloakAngular = () =>
  provideKeycloak({
    config: {
      realm: environment.keycloakRealm,
      url: environment.keycloakUrl,
      clientId: environment.keycloakClient,
    },
    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${environment.frontendUrl}/assets/silent-check-sso.html`,
      redirectUri: `${environment.frontendUrl}/starter`,
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
        useValue: [localhostCondition],
      },
    ],
  });

export const provideKeycloakSSR = () =>
  provideKeycloak({
    config: {
      realm: environment.keycloakRealm,
      url: environment.keycloakUrl,
      clientId: environment.keycloakClient,
    },
    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${environment.frontendUrl}/assets/silent-check-sso.html`,
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'logout',
        sessionTimeout: 60000,
      }),
    ],
    providers: [AutoRefreshTokenService, UserActivityService],
  });
