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
import { authInterceptor } from './core/interceptors/http/auth.interceptor';
import { errorInterceptor } from './core/interceptors/http/error.interceptor';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ConfirmationService } from 'primeng/api';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),
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
