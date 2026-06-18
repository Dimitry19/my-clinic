import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
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

  currentDate = signal(new Date());

  constructor(
    public router: Router,
    public httpClient: HttpClient,

    public apiService: ApiResponseService,
  ) {}

  public getCurrentMonth(): number {
    return this.currentDate().getMonth();
  }
  public getCurrentYear(): number {
    return this.currentDate().getFullYear();
  }

  formatDateLocaleDateString(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatHeure(iso: string) {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  public getInitiales(prenom?: string | null, nom?: string | null): string {
    const initialePrenom = prenom?.charAt(0) ?? '';
    const initialeNom = nom?.charAt(0) ?? '';

    return `${initialePrenom}${initialeNom}`.toUpperCase();
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
    if (entite === Entite.CONSULTATION) {
      label404 = 'Consultation introuvable.';
    }
    if (entite === Entite.PATIENT) {
      label404 = 'Patient introuvable.';
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
