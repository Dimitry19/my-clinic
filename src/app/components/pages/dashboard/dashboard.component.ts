import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { AvatarModule } from 'primeng/avatar';
import { StatDashboard } from '../../../core/models/all/all.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { DashboardService } from '../../../core/services/dashboard/dashboard.service';
import { TooltipModule } from 'primeng/tooltip';
import { RendezVous } from '../../../core/models/agenda/agenda.model';
import { Entite } from '../../../core/models/enums/enums.model';
import { CommonService } from '../../../core/services/common.services';
import { TranslatePipe } from '../../../core/pipe/i18n.pipe';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'clnt-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    SkeletonModule,
    ChartModule,
    AvatarModule,
    TooltipModule,
    TranslatePipe,
  ],
  template: `
    <div class="dashboard">
      <!-- En-tête -->
      <div class="page-header">
        <div>
          <h2>
            {{ 'common.hello' | translate }}, {{ auth.userLabel() }}
            {{ auth.currentUser()?.prenom }} 👋
          </h2>
          <p>
            {{ today | date: 'EEEE d MMMM yyyy' : '' : lang() }}
            ·
            {{ 'dashboard.dashboard' | translate }}
          </p>
        </div>
        <p-button
          [label]="'patient.new' | translate"
          icon="pi pi-plus"
          routerLink="/patients/add"
        />
      </div>

      <!-- Statistiques -->
      <div class="stats-grid" *ngIf="stats(); else statsSkeleton">
        <div class="stat-card" *ngFor="let s of statCards()">
          <div class="stat-icon" [style.background]="s.bg">
            <i class="pi" [ngClass]="s.icon" [style.color]="s.color"></i>
          </div>
          <div class="stat-body">
            <span class="stat-label">{{ s.label | translate }}</span>
            <span class="stat-value">{{ s.value }}</span>
            <span class="stat-delta" [style.color]="s.deltaColor">{{
              s.delta
            }}</span>
          </div>
        </div>
      </div>
      <ng-template #statsSkeleton>
        <div class="stats-grid">
          <p-skeleton
            *ngFor="let i of [1, 2, 3, 4]"
            height="100px"
            borderRadius="12px"
          />
        </div>
      </ng-template>

      <!-- Contenu principal -->
      <div class="main-grid">
        <!-- File d'attente -->
        <p-card
          [header]="'dashboard.todayQueue' | translate"
          styleClass="queue-card"
        >
          <ng-template pTemplate="header">
            <div class="card-header-row">
              <span class="card-title">{{
                'dashboard.queue' | translate
              }}</span>
              <p-button
                [label]="'common.seeAll' | translate"
                [text]="true"
                size="small"
                routerLink="/agenda"
              />
            </div>
          </ng-template>
          <p-table
            [value]="rendezVous()"
            [rows]="6"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="body" let-rdv>
              <tr>
                <td>
                  <div class="patient-cell">
                    <p-avatar
                      [label]="rdv.patientPrenom[0] + rdv.patientNom[0]"
                      shape="circle"
                      size="normal"
                      [style]="{ background: '#E6F1FB', color: '#0C447C' }"
                    />
                    <div>
                      <div class="patient-name">
                        {{ rdv.patientPrenom }} {{ rdv.patientNom }}
                      </div>
                      <div class="patient-motif">{{ rdv.motif }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ rdv.dateHeure | date: 'HH:mm' }}</td>
                <td>
                  <p-tag
                    [value]="getStatutLabel(rdv.statut)"
                    [severity]="getStatutSeverity(rdv.statut)"
                  />
                </td>
                <td>
                  <p-button
                    icon="pi pi-eye"
                    [text]="true"
                    size="small"
                    [pTooltip]="'common.seeFolder' | translate"
                    tooltipPosition="top"
                    [routerLink]="['/patients', rdv.patientId]"
                  />
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="empty-msg">
                  {{ 'dashboard.noRdv' | translate }}
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <!-- Graphique activité -->
        <p-card styleClass="chart-card">
          <ng-template pTemplate="header">
            <div class="card-header-row">
              <span class="card-title">{{
                'dashboard.sevenDays' | translate
              }}</span>
            </div>
          </ng-template>
          <p-chart
            type="bar"
            [data]="chartData"
            [options]="chartOptions"
            height="220px"
          />
        </p-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        h2 {
          font-size: 1.4rem;
          font-weight: 500;
          margin: 0 0 4px;
        }
        p {
          color: var(--p-text-muted-color);
          font-size: 14px;
          margin: 0;
        }
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
      }
      .stat-card {
        background: var(--p-surface-0);
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        border: 1px solid var(--p-surface-100);
      }
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        i {
          font-size: 24px;
        }
      }
      .stat-label {
        font-size: 12px;
        color: var(--p-text-muted-color);
        display: block;
      }
      .stat-value {
        font-size: 24px;
        font-weight: 500;
        display: block;
      }
      .stat-delta {
        font-size: 12px;
        display: block;
      }
      .main-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        gap: 1rem;
      }
      .card-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem 0;
      }
      .card-title {
        font-size: 15px;
        font-weight: 500;
      }
      .patient-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .patient-name {
        font-weight: 500;
        font-size: 14px;
      }
      .patient-motif {
        font-size: 12px;
        color: var(--p-text-muted-color);
      }
      .empty-msg {
        text-align: center;
        color: var(--p-text-muted-color);
        padding: 2rem;
      }
      @media (max-width: 1100px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .main-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private dashService = inject(DashboardService);
  private commonService = inject(CommonService);
  private i18n = inject(I18nService);

  readonly lang = computed(() => this.i18n.currentLang());

  auth = inject(AuthService);

  stats = signal<StatDashboard | null>(null);
  rendezVous = signal<RendezVous[]>([]);
  today = new Date();

  statCards = signal<any[]>([]);

  chartOptions = {
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 5 } } },
  };
  chartData: any;
  private weeklyData: number[] = [];
  constructor() {
    effect(() => {
      this.i18n.currentLang(); // déclenche quand la langue change
      this.updateChart();
    });
  }

  ngOnInit() {
    this.allStats();
    this.allRendezVous();
    this.allCharts();
  }
  allRendezVous() {
    this.dashService
      .getRendezVousDuJour()
      .subscribe((r) => this.rendezVous.set(r));
  }

  allCharts() {
    this.dashService.getWeeklyConsultations().subscribe((data: number[]) => {
      this.weeklyData = data;
      this.updateChart();
    });
  }

  allStats() {
    this.dashService.getStats().subscribe((s) => {
      this.stats.set(s);
      this.statCards.set([
        {
          label: 'dashboard.cards.patients',
          value: s.patientsAujourdhui,
          icon: 'pi-users',
          bg: '#E6F1FB',
          color: '#185FA5',
          delta: '↑ +3 vs hier',
          deltaColor: '#0F6E56',
        },
        {
          label: 'dashboard.cards.wait',
          value: s.enAttente,
          icon: 'pi-clock',
          bg: '#FAEEDA',
          color: '#BA7517',
          delta: '● Salle B',
          deltaColor: '#BA7517',
        },
        {
          label: 'dashboard.cards.remainRdv',
          value: s.rdvRestants,
          icon: 'pi-calendar',
          bg: '#E1F5EE',
          color: '#0F6E56',
          delta: "Jusqu'à 17h",
          deltaColor: '#0F6E56',
        },
        {
          label: 'dashboard.cards.consultations',
          value: s.consultationsTerminees,
          icon: 'pi-check',
          bg: '#EEEDFE',
          color: '#534AB7',
          delta: 'Ce matin',
          deltaColor: '#534AB7',
        },
      ]);
    });
  }

  getStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.AGENDA);
  }

  getStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.AGENDA);
  }

  updateChart() {
    this.chartData = {
      labels: this.getWeekDays(),
      datasets: [
        {
          label: 'dashboard.consultations',
          data: this.weeklyData,
          backgroundColor: '#185FA5',
          borderRadius: 6,
        },
      ],
    };
  }

  getWeekDays(): string[] {
    return [
      this.i18n.translate('dashboard.days.monday'),
      this.i18n.translate('dashboard.days.tuesday'),
      this.i18n.translate('dashboard.days.wednesday'),
      this.i18n.translate('dashboard.days.thursday'),
      this.i18n.translate('dashboard.days.friday'),
      this.i18n.translate('dashboard.days.saturday'),
      this.i18n.translate('dashboard.days.sunday'),
    ];
  }
}
