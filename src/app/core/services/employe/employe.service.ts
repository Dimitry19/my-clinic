import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  Employe,
  FicheDePaie,
  Conge,
} from '../../models/employe/employe.model';
import { ApiResponse } from '../../models/response/api-response.model';
import { environment } from '../../../../environments/environment';
import { CommonService } from '../common.services';
import { Entite } from '../../models/enums/enums.model';
import { Page } from '../../models/all/all.model';

@Injectable({ providedIn: 'root' })
export class EmployeService {
  private http = inject(HttpClient);
  private commonService = inject(CommonService);

  private readonly API = `${environment.apiUrl}/employes`;

  findAll(page = 0, size = 20, search = '', departement = '') {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('q', search);
    if (departement) params = params.set('departement', departement);
    const url = search ? `${this.API}/search` : `${this.API}/departement`;
    return this.http.get<ApiResponse<Page<Employe>>>(url, { params }).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  findAllMedecin(page = 0, size = 20, search = '', departement = '') {
    let params = new HttpParams().set('page', page).set('size', size);
    if (search) params = params.set('q', search);

    const url = `${this.API}/search/medecin`;
    return this.http.get<ApiResponse<Page<Employe>>>(url, { params }).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  findEmployesByDepartement(page = 0, size = 20, departement = '') {
    let params = new HttpParams().set('page', page).set('size', size);
    if (departement) params = params.set('departement', departement);
    const url = `${this.API}/departement`;
    return this.http.get<ApiResponse<Page<Employe>>>(url, { params }).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  findEmployesByDepartementConsultation(page = 0, size = 20, departement = '') {
    let params = new HttpParams().set('page', page).set('size', size);
    if (departement) params = params.set('departement', departement);
    const url = `${this.API}/consultation/departement`;
    return this.http.get<ApiResponse<Page<Employe>>>(url, { params }).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  findById(id: string): Observable<Employe> {
    return this.http.get<ApiResponse<Employe>>(`${this.API}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  findByUtilisateurId(id: string): Observable<Employe> {
    return this.http.get<ApiResponse<Employe>>(`${this.API}/user/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  create(e: Partial<Employe>): Observable<Employe> {
    return this.http.post<ApiResponse<Employe>>(this.API, e).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  edit(id: string, e: Partial<Employe>): Observable<Employe> {
    return this.http.put<ApiResponse<Employe>>(`${this.API}/${id}`, e).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  changeStatus(id: string, statut: string): Observable<Employe> {
    return this.http
      .patch<ApiResponse<Employe>>(`${this.API}/${id}`, { statut })
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`).pipe(
      map(() => void 0),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }

  getConges(id: string): Observable<Conge[]> {
    return this.http.get<ApiResponse<Conge[]>>(`${this.API}/conges/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
    );
  }
  getFichesDePaie(id: string): Observable<FicheDePaie[]> {
    return this.http
      .get<ApiResponse<FicheDePaie[]>>(`${this.API}/paies/${id}`)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonService.handleError(e, Entite.EMPLOYE)),
      );
  }
}
