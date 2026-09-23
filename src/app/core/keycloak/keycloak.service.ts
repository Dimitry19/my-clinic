import {
  afterNextRender,
  computed,
  effect,
  inject,
  Injectable,
  Injector,
  signal,
} from '@angular/core';
import {
  KEYCLOAK_EVENT_SIGNAL,
  KeycloakEventType,
  ReadyArgs,
  typeEventArgs,
} from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class KeycloakStatusService {
  private readonly injector = inject(Injector);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  keycloakType = computed(() => this.keycloakSignal().type);
  authenticated = signal(false);

  constructor() {
    // ❌ updates the `authenticated` signal but logout and login button are visible
    // this only works when RenderMode.Client is used for the route
    // effect(() => {
    //   const keycloakEvent = this.keycloakSignal();
    //   console.log('Keycloak event:', keycloakEvent);

    //   if (keycloakEvent.type === KeycloakEventType.Ready) {
    //     this.authenticated.set(typeEventArgs<ReadyArgs>(keycloakEvent.args));
    //   }

    //   if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
    //     this.authenticated.set(false);
    //   }
    // });

    // ✅ workes - only the logout button is visible when logged in and refreshed
    // effect(() => {
    //   const keycloakEvent = this.keycloakSignal();
    //   console.log('Keycloak event:', keycloakEvent);

    //   afterNextRender(
    //     () => {
    //       console.log('afterNextRender:', keycloakEvent);

    //       if (keycloakEvent.type === KeycloakEventType.Ready) {
    //         this.authenticated.set(
    //           typeEventArgs<ReadyArgs>(keycloakEvent.args)
    //         );
    //       }

    //       if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
    //         this.authenticated.set(false);
    //       }
    //     },
    //     { injector: this.injector }
    //   );
    // });

    // ✅ workes - only the logout button is visible when logged in and refreshed
    afterNextRender(() => {
      effect(
        () => {
          const keycloakEvent = this.keycloakSignal();
          console.log('Keycloak event:', keycloakEvent);

          if (keycloakEvent.type === KeycloakEventType.Ready) {
            this.authenticated.set(
              typeEventArgs<ReadyArgs>(keycloakEvent.args),
            );
          }

          if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
            this.authenticated.set(false);
          }
        },
        { injector: this.injector },
      );
    });
  }
}
