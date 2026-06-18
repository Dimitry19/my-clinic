import {
  Consultation,
  ConsultationRequest,
} from './../../models/patient/consultation.model';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

import { ApiResponse } from '../../models/response/api-response.model';
import { Page } from '../../models/all/all.model';
import { environment } from '../../../../environments/environment.prod';
import { Patient } from '../../models/patient/patient.model';
import { Entite } from '../../models/enums/enums.model';
import { CommonService } from '../common.services';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private http = inject(HttpClient);
  private commonService = inject(CommonService);
  private API = environment.apiUrl + '/consultations';

  findAll(page = 0, size = 20, search = '') {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('q', search);
    const url = search ? `${this.API}/search` : this.API;
    return this.http
      .get<ApiResponse<Page<Patient>>>(url, { params })
      .pipe(map((r) => r.data));
  }

  findById(id: string) {
    return this.http.get<ApiResponse<Patient>>(`${this.API}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.CONSULTATION)),
    );
  }

  create(c: Partial<ConsultationRequest>) {
    return this.http.post<ApiResponse<Consultation>>(this.API, c).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.CONSULTATION)),
    );
  }

  edit(id: string, c: Partial<ConsultationRequest>) {
    return this.http
      .put<ApiResponse<Consultation>>(`${this.API}/${id}`, c)
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.CONSULTATION),
        ),
      );
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.CONSULTATION)),
    );
  }
}
