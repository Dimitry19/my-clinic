import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Medicament,
  MouvementRequest,
  StockStats,
} from '../../models/pharmacie/medicament.model';
import { Page } from '../../models/all/all.model';
import { ApiResponse } from '../../models/response/api-response.model';
import { CommonService } from '../common.services';
import { Entite } from '../../models/enums/enums.model';
import { environment } from '../../../../environments/environment';
import { Configuration } from '../../models/configuration/configuration.model';

@Injectable({ providedIn: 'root' })
export class MedicamentService {
  private http = inject(HttpClient);
  private commonService = inject(CommonService);

  private readonly API = `${environment.apiUrl}/pharmacie/medicaments`;

  findAll(
    page = 0,
    size = Configuration.pageSize,
    search = '',
    actif?: boolean,
  ): Observable<Page<Medicament>> {
    console.log('searchQuery dans le search :', search);
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('q', search);
    if (actif !== undefined) params = params.set('actif', actif);
    console.log('Params HTTP:', params.toString());
    return this.http
      .get<ApiResponse<Page<Medicament>>>(this.API, { params })
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
      );
  }

  findById(id: string): Observable<Medicament> {
    return this.http.get<ApiResponse<Medicament>>(`${this.API}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
    );
  }

  create(req: Partial<Medicament>): Observable<Medicament> {
    return this.http.post<ApiResponse<Medicament>>(this.API, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
    );
  }

  edit(id: string, req: Partial<Medicament>): Observable<Medicament> {
    return this.http
      .put<ApiResponse<Medicament>>(`${this.API}/${id}`, req)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`).pipe(
      map(() => void 0),
      catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
    );
  }

  mouvement(req: MouvementRequest): Observable<Medicament> {
    return this.http
      .post<ApiResponse<Medicament>>(`${this.API}/mouvement`, req)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
      );
  }

  getAlertes(): Observable<Medicament[]> {
    return this.http.get<ApiResponse<Medicament[]>>(`${this.API}/alertes`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
    );
  }

  getRuptures(): Observable<Medicament[]> {
    return this.http
      .get<ApiResponse<Medicament[]>>(`${this.API}/ruptures`)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
      );
  }

  getStats(): Observable<StockStats> {
    return this.http.get<ApiResponse<StockStats>>(`${this.API}/stats`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.MEDICAMENT)),
    );
  }
}
