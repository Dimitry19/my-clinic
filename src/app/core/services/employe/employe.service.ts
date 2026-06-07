import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EmployePage, Employe } from '../../models/employe/employe.model';
import { ApiResponse } from '../../models/response/api-response.model';
import { environment } from '../../../../environments/environment';

export interface ServiceError {
  code:
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'NETWORK'
    | 'SERVER'
    | 'FORBIDDEN'
    | 'UNKNOWN';
  message: string;
  field?: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeService {
  private http = inject(HttpClient);

  private API = environment.apiUrl + '/employes';

  findAll(
    page = 0,
    size = 20,
    search = '',
    departement = '',
  ): Observable<EmployePage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('q', search);
    if (departement) params = params.set('departement', departement);
    const url = search ? `${this.API}/search` : this.API;
    return this.http.get<ApiResponse<EmployePage>>(url, { params }).pipe(
      map((r) => r.data),
      catchError(this.handleError),
    );
  }

  findById(id: string): Observable<Employe> {
    return this.http.get<ApiResponse<Employe>>(`${this.API}/${id}`).pipe(
      map((r) => r.data),
      catchError(this.handleError),
    );
  }

  create(e: Partial<Employe>): Observable<Employe> {
    return this.http.post<ApiResponse<Employe>>(this.API, e).pipe(
      map((r) => r.data),
      catchError(this.handleError),
    );
  }

  edit(id: string, e: Partial<Employe>): Observable<Employe> {
    return this.http.put<ApiResponse<Employe>>(`${this.API}/${id}`, e).pipe(
      map((r) => r.data),
      catchError(this.handleError),
    );
  }

  changeStatus(id: string, statut: string): Observable<Employe> {
    return this.http
      .patch<ApiResponse<Employe>>(`${this.API}/${id}/statut`, { statut })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`).pipe(
      map(() => void 0),
      catchError(this.handleError),
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let error: ServiceError;
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
        message: err.error ?? 'Employé introuvable.',
      };
    } else if (err.status === 409) {
      error = {
        code: 'CONFLICT',
        message: err.error ?? 'Un employé avec cet email existe déjà.',
        field: 'email',
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
}
