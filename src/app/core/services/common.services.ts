import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { ApiResponseService } from '../models/response/api.service';
import { ApiResponse } from '../models/response/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  menuRoles: string = '/assets/json/menu-roles.json';
  delivery: string = '/assets/mock/delivery.json';

  private menuSubject = new BehaviorSubject(false);
  menuSubject$ = this.menuSubject.asObservable();

  constructor(
    public router: Router,
    public httpClient: HttpClient,

    public apiService: ApiResponseService,
  ) {}

  getMenuRoles() {
    //return this.httpClient.get(this.menuRoles).pipe(map((res: any) => res));
  }

  getRolesDisplay() {
    //return this.httpClient.get(this.rolesDisplay).pipe(map((res: any) => res));
  }

  public isSuccessResponse(response: ApiResponse): boolean {
    return this.apiService.isSuccessResponse(response);
  }

  public isErrorResponse(response: ApiResponse): boolean {
    return !this.apiService.isSuccessResponse(response);
  }

  details = (path: string, id: string) => {
    this.router.navigate([path, id]);
  };

  /**
   *Actualise le composant en accédant à un nouvel itinéraire tout en préservant l'URL actuelle et en ignorant le changement d'emplacement.
   * @param param - Le paramètre à transmettre à la route.
   * @param routes - Les itinéraires vers lesquels naviguer(max 2).
   */
  refreshSelfComponent(param?: any, ...routes: string[]): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      const routeParams = param ? [param] : [];
      const finalRoutes = routes.slice(0, 2).concat(routeParams);
      this.router.navigate(finalRoutes);
    });
  }

  public globalErrorHandler(error: any): Observable<any> {
    if (error instanceof HttpErrorResponse) {
      return of(error.error.message);
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
}
