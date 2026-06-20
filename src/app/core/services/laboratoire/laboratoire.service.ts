import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';

import { Page } from '../../models/all/all.model';
import { environment } from '../../../../environments/environment.prod';
import {
  ExamenLabo,
  ExamenLaboRequest,
} from '../../models/laboratoire/laboratoire.model';
import { Entite } from '../../models/enums/enums.model';
import { CommonService } from '../common.services';
import { ApiResponse } from '../../models/response/api-response.model';

@Injectable({ providedIn: 'root' })
export class ExamenLaboService {
  private http = inject(HttpClient);
  private commonService = inject(CommonService);
  private readonly base = `${environment.apiUrl}/laboratoire`;

  findByPatient(patientId: string, page = 0, size = 10) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<
        ApiResponse<Page<ExamenLabo>>
      >(`${this.base}/patient/${patientId}`, { params })
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }

  findByConsultation(consultationId: string): Observable<ExamenLabo[]> {
    return this.http
      .get<
        ApiResponse<ExamenLabo[]>
      >(`${this.base}/consultation/${consultationId}`)
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }

  findById(id: string): Observable<ExamenLabo> {
    return this.http.get<ApiResponse<ExamenLabo>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.LABORATOIRE)),
    );
  }

  create(req: ExamenLaboRequest): Observable<ExamenLabo> {
    return this.http.post<ApiResponse<ExamenLabo>>(this.base, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.LABORATOIRE)),
    );
  }

  edit(id: string, req: ExamenLaboRequest): Observable<ExamenLabo> {
    return this.http
      .put<ApiResponse<ExamenLabo>>(`${this.base}/${id}`, req)
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }

  changeStatut(id: string, statut: string): Observable<ExamenLabo> {
    return this.http
      .patch<ApiResponse<ExamenLabo>>(`${this.base}/${id}/statut`, { statut })
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.LABORATOIRE)),
    );
  }
}
