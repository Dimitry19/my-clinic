import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RdvRequest } from '../../models/agenda/agenda.model';
import { RendezVous } from '../../models/all/all.model';
import { ApiResponse } from '../../models/response/api-response.model';

export interface ServiceError {
  code:
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'NETWORK'
    | 'SERVER'
    | 'FORBIDDEN'
    | 'UNKNOWN';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private API = '/api/agenda';

  findByMois(
    annee: number,
    mois: number,
    medecinId?: string,
  ): Observable<RendezVous[]> {
    let params = new HttpParams().set('annee', annee).set('mois', mois);
    if (medecinId) params = params.set('medecinId', medecinId);
    return this.http
      .get<ApiResponse<RendezVous[]>>(`${this.API}/mois`, { params })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  findAujourdhui(): Observable<RendezVous[]> {
    return this.http
      .get<ApiResponse<RendezVous[]>>(`${this.API}/aujourdhui`)
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  creer(req: RdvRequest): Observable<RendezVous> {
    return this.http.post<ApiResponse<RendezVous>>(this.API, req).pipe(
      map((r) => r.data),
      catchError(this.handleError),
    );
  }

  modifier(id: string, req: Partial<RdvRequest>): Observable<RendezVous> {
    return this.http
      .put<ApiResponse<RendezVous>>(`${this.API}/${id}`, req)
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  changerStatut(id: string, statut: string): Observable<RendezVous> {
    return this.http
      .patch<ApiResponse<RendezVous>>(`${this.API}/${id}/statut`, { statut })
      .pipe(
        map((r) => r.data),
        catchError(this.handleError),
      );
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`).pipe(
      map(() => void 0),
      catchError(this.handleError),
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let e: ServiceError;
    if (err.status === 0)
      e = { code: 'NETWORK', message: 'Connexion impossible au serveur.' };
    else if (err.status === 403)
      e = { code: 'FORBIDDEN', message: 'Action non autorisée.' };
    else if (err.status === 404)
      e = { code: 'NOT_FOUND', message: 'Rendez-vous introuvable.' };
    else if (err.status === 409)
      e = { code: 'CONFLICT', message: 'Ce créneau est déjà occupé.' };
    else if (err.status >= 500)
      e = {
        code: 'SERVER',
        message: 'Erreur serveur. Réessayez dans quelques instants.',
      };
    else
      e = {
        code: 'UNKNOWN',
        message: err.error?.message ?? 'Erreur inattendue.',
      };
    return throwError(() => e);
  }
}
