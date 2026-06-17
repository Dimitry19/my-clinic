import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApiResponse } from '../../models/response/api-response.model';
import { Page } from '../../models/all/all.model';
import { environment } from '../../../../environments/environment.prod';
import { Patient } from '../../models/patient/patient.model';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private http = inject(HttpClient);
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
    return this.http
      .get<ApiResponse<Patient>>(`${this.API}/${id}`)
      .pipe(map((r) => r.data));
  }

  create(p: Partial<Patient>) {
    return this.http
      .post<ApiResponse<Patient>>(this.API, p)
      .pipe(map((r) => r.data));
  }

  edit(id: string, p: Partial<Patient>) {
    return this.http
      .put<ApiResponse<Patient>>(`${this.API}/${id}`, p)
      .pipe(map((r) => r.data));
  }

  delete(id: string) {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }
}
