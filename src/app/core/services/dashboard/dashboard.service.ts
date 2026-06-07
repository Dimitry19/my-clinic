import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { StatDashboard, RendezVous } from '../../models/all/all.model';
import { ApiResponse } from '../../models/response/api-response.model';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private API = environment.apiUrl + '/dashboard';

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getStats();
      this.getRendezVousDuJour();
    }
  }

  getStats() {
    return this.http
      .get<ApiResponse<StatDashboard>>(`${this.API}/stats`)
      .pipe(map((r) => r.data));
  }

  getRendezVousDuJour() {
    return this.http
      .get<ApiResponse<RendezVous[]>>(`${this.API}/agenda/today`)
      .pipe(map((r) => r.data));
  }

  getWeeklyConsultations() {
    return this.http
      .get<ApiResponse<number[]>>(`${this.API}/chart`)
      .pipe(map((r) => r.data));
  }
}
