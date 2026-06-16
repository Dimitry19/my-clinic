import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';

import { ApiResponseService } from '../models/response/api.service';
import { ApiResponse } from '../models/response/api-response.model';
import { ServiceError } from '../models/all/all.model';
import { Entite } from '../models/enums/enums.model';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  menuRoles: string = '/assets/json/menu-roles.json';
  delivery: string = '/assets/mock/delivery.json';

  private menuSubject = new BehaviorSubject(false);
  menuSubject$ = this.menuSubject.asObservable();

  constructor(
    public router: Router,
    public httpClient: HttpClient,

    public apiService: ApiResponseService,
  ) {}

  public getInitiales(prenom: string, nom: string) {
    return `${prenom[0]}${nom[0]}`.toUpperCase();
  }

  getMenuRoles() {
    //return this.httpClient.get(this.menuRoles).pipe(map((res: any) => res));
  }

  getRolesDisplay() {
    //return this.httpClient.get(this.rolesDisplay).pipe(map((res: any) => res));
  }

  public isSuccessResponse(response: ApiResponse): boolean {
    return this.apiService.isSuccessResponse(response);
  }

  public isErrorResponse(response: ApiResponse): boolean {
    return !this.apiService.isSuccessResponse(response);
  }

  details = (path: string, id: string) => {
    this.router.navigate([path, id]);
  };

  /**
   *Actualise le composant en accédant à un nouvel itinéraire tout en préservant l'URL actuelle et en ignorant le changement d'emplacement.
   * @param param - Le paramètre à transmettre à la route.
   * @param routes - Les itinéraires vers lesquels naviguer(max 2).
   */
  refreshSelfComponent(param?: any, ...routes: string[]): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      const routeParams = param ? [param] : [];
      const finalRoutes = routes.slice(0, 2).concat(routeParams);
      this.router.navigate(finalRoutes);
    });
  }

  public handleError(
    err: HttpErrorResponse,
    entite: Entite,
  ): Observable<never> {
    let error: ServiceError;
    let label404 = '';
    let label409 = '';
    let field = '';

    if (entite === Entite.EMPLOYE) {
      label404 = 'Employé introuvable.';
      label409 = 'Un employé avec cet email existe déjà.';
      field = 'email';
    }

    if (entite === Entite.AGENDA) {
      label404 = 'Rendez-vous introuvable.';
      label409 = 'Ce créneau est déjà occupé.';
    }

    if (err.status === 0) {
      error = {
        code: 'NETWORK',
        message:
          'Impossible de contacter le serveur. Vérifiez votre connexion.',
      };
    } else if (err.status === 403) {
      error = {
        code: 'FORBIDDEN',
        message: "Vous n'avez pas les droits pour effectuer cette action.",
      };
    } else if (err.status === 404) {
      error = {
        code: 'NOT_FOUND',
        message: err.error ?? label404,
      };
    } else if (err.status === 409) {
      error = {
        code: 'CONFLICT',
        message: err.error ?? label409,
        field: field,
      };
    } else if (err.status >= 500) {
      error = {
        code: 'SERVER',
        message: 'Erreur serveur. Réessayez dans quelques instants.',
      };
    } else {
      error = {
        code: 'UNKNOWN',
        message: err.error ?? 'Une erreur inattendue est survenue.',
      };
    }
    return throwError(() => error);
  }

  public globalErrorHandler(error: any): Observable<any> {
    if (error instanceof HttpErrorResponse) {
      return this.globalStatusErrorHandler(error);
    }
    if (typeof error === 'object') {
      return of(error);
    }
    if (typeof error.error === 'object') {
      return of(error.error);
    }

    if (typeof error === 'string') {
      return of(error);
    }
    if (error.error instanceof ErrorEvent) {
      return of(error.error.message);
    }
    return of(error);
  }

  public globalStatusErrorHandler(error: HttpErrorResponse) {
    return throwError(() => ({
      status: error.status,
      message:
        error.error?.message ?? error.message ?? 'Une erreur est survenue',
      error: error.error,
    }));
  }
}
