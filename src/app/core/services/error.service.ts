import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of, throwError } from 'rxjs';

import { ServiceError } from '../models/all/all.model';
import { Entite } from '../models/enums/enums.model';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
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

    if (entite === Entite.ORDONNANCE) {
      label404 = 'Ordonnance introuvable.';
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
