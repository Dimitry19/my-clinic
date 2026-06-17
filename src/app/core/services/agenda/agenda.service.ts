import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { RdvRequest, RendezVous } from '../../models/agenda/agenda.model';

import { ApiResponse } from '../../models/response/api-response.model';
import { CommonService } from '../common.services';
import { Entite } from '../../models/enums/enums.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private commonService = inject(CommonService);
  private API = environment.apiUrl + '/agenda';

  findAgendaByPeriode(
    annee: number,
    mois: number,
    medecinId?: string,
  ): Observable<RendezVous[]> {
    let params = new HttpParams().set('annee', annee).set('mois', mois);
    if (medecinId) params = params.set('medecinId', medecinId);
    return this.http
      .get<ApiResponse<RendezVous[]>>(`${this.API}`, { params })
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.AGENDA)),
      );
  }

  findAgendaByDoctorAndPatient(
    annee: number,
    mois: number,
    medecinId: string,
    patientId: string,
  ): Observable<RendezVous[]> {
    let params = new HttpParams().set('annee', annee).set('mois', mois);
    if (medecinId) params = params.set('medecinId', medecinId);
    return this.http
      .get<
        ApiResponse<RendezVous[]>
      >(`${this.API}/medecin/${patientId}`, { params })
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.AGENDA)),
      );
  }

  findToday(): Observable<RendezVous[]> {
    return this.http
      .get<ApiResponse<RendezVous[]>>(`${this.API}/aujourdhui`)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.AGENDA)),
      );
  }

  create(req: Partial<RdvRequest>): Observable<RendezVous> {
    return this.http.post<ApiResponse<RendezVous>>(this.API, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.AGENDA)),
    );
  }

  edit(id: string, req: Partial<RdvRequest>): Observable<RendezVous> {
    return this.http
      .put<ApiResponse<RendezVous>>(`${this.API}/${id}`, req)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.AGENDA)),
      );
  }

  updateStatus(id: string, statut: string): Observable<RendezVous> {
    return this.http
      .patch<ApiResponse<RendezVous>>(`${this.API}/${id}`, { statut })
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.AGENDA)),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`).pipe(
      map(() => void 0),
      catchError((e) => this.commonService.handleError(e, Entite.AGENDA)),
    );
  }
}
