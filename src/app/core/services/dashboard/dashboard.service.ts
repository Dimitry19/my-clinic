import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { StatDashboard } from '../../models/all/all.model';
import { ApiResponse } from '../../models/response/api-response.model';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { RendezVous } from '../../models/agenda/agenda.model';
import { AuthService } from '../auth/auth.service';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  auth = inject(AuthService);

  private readonly email = this.auth.currentUser()?.email ?? '';

  private readonly API = `${environment.apiUrl}/dashboard`;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getStats(this.email);
      this.getRendezVousDuJour(this.email);
    }
  }

  getStats(email: string) {
    let params = new HttpParams().set('email', email);
    return this.http
      .get<ApiResponse<StatDashboard>>(`${this.API}/stats`, { params })
      .pipe(map((r) => r.data));
  }

  getRendezVousDuJour(email: string) {
    if (email === '') return of([]);
    let params = new HttpParams().set('email', email);
    return this.http
      .get<ApiResponse<RendezVous[]>>(`${this.API}/agenda/today`, { params })
      .pipe(map((r) => r.data));
  }

  getWeeklyConsultations() {
    return this.http
      .get<ApiResponse<number[]>>(`${this.API}/chart`)
      .pipe(map((r) => r.data));
  }
}
