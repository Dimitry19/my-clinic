import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

import { ApiResponse } from '../../models/response/api-response.model';
import { CommonService } from '../common.services';
import { Entite } from '../../models/enums/enums.model';
import {
  ResultatLabo,
  ResultatLaboRequest,
} from '../../models/laboratoire/resultat.labo.model';

@Injectable({ providedIn: 'root' })
export class ResultatLaboService {
  private http = inject(HttpClient);
  private commonSvc = inject(CommonService);
  private readonly base = `${environment.apiUrl}/resultats-labo`;

  findByExamen(examenId: string): Observable<ResultatLabo | null> {
    return this.http
      .get<ApiResponse<ResultatLabo>>(`${this.base}/examen/${examenId}`)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonSvc.handleError(e, Entite.LABORATOIRE)),
      );
  }

  findById(id: string): Observable<ResultatLabo> {
    return this.http.get<ApiResponse<ResultatLabo>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.LABORATOIRE)),
    );
  }

  create(req: ResultatLaboRequest): Observable<ResultatLabo> {
    return this.http.post<ApiResponse<ResultatLabo>>(this.base, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.LABORATOIRE)),
    );
  }

  edit(id: string, req: ResultatLaboRequest): Observable<ResultatLabo> {
    return this.http
      .put<ApiResponse<ResultatLabo>>(`${this.base}/${id}`, req)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonSvc.handleError(e, Entite.LABORATOIRE)),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.LABORATOIRE)),
    );
  }
}
