import { inject } from '@angular/core';
import {
  Router,
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { CommonService } from '../../core/services/common.services';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  /*if (!authService.isAuth()) {
    return router.createUrlTree(['/authenticate']);
  }
  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (requiredRoles?.length && !authService.hasRole(requiredRoles)) {
    return router.createUrlTree(['/unauthorized']);
  }*/

  return true;
};
