import { AuthService } from '../services/auth/auth.service';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { DOCUMENT, isPlatformServer } from '@angular/common';

/* const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  const requiredRole = route.data['roles'] as string | undefined;
  if (!requiredRole) {
    return false;
  }

  const hasRequiredRole = (role: string): boolean =>
    Object.values(grantedRoles.resourceRoles).some((roles) =>
      roles.includes(role),
    );

  if (authenticated && hasRequiredRole(requiredRole)) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/login');
};

export const authGuardOld = createAuthGuard<CanActivateFn>(isAccessAllowed); */

export const authGuard: CanActivateFn = (route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;

  const auth = inject(AuthService);
  const router = inject(Router);
  const document = inject(DOCUMENT);
  //await auth.whenReady();
  console.log('[guard] ready, authenticated =', auth.isAuthenticated());

  if (!auth.isAuthenticated()) {
    //auth.loginKeycloak(document.location.origin + state.url);
    //return false;
  }

  const required = route.data['roles'] as string[] | undefined;
  console.log('[guard] required =', required);
  if (required?.length && !auth.hasRole(required)) {
    // return router.createUrlTree(['/not-found']);
  }
  return true;
};
