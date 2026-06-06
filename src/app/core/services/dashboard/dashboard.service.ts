import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { StatDashboard, RendezVous } from '../../models/all/all.model';
import { ApiResponse } from '../../models/response/api-response.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getStats();
      this.getRendezVousDuJour();
    }
  }
  getStats() {
    return this.http
      .get<ApiResponse<StatDashboard>>('/api/dashboard/stats')
      .pipe(map((r) => r.data));
  }

  getRendezVousDuJour() {
    return this.http
      .get<ApiResponse<RendezVous[]>>('/api/agenda/aujourdhui')
      .pipe(map((r) => r.data));
  }
}
