import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  Employe,
  DEPARTEMENTS,
  Conge,
  FicheDePaie,
  TimelineEvent,
} from '../../../../core/models/employe/employe.model';
import { EmployeService } from '../../../../core/services/employe/employe.service';
import { EmployeFormComponent } from '../formulaire/employe-form.component';
import { catchError, EMPTY, forkJoin, of } from 'rxjs';
import { Entite, StatutConge } from '../../../../core/models/enums/enums.model';
import { ServiceError } from '../../../../core/models/all/all.model';
import { CommonService } from '../../../../core/services/common.services';
import { environment } from '../../../../../environments/environment';

const MOIS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Jun',
  'Jul',
  'Aoû',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];

@Component({
  selector: 'clnt-employe-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TabsModule,
    ButtonModule,
    TagModule,
    CardModule,
    SkeletonModule,
    TableModule,
    TimelineModule,
    AvatarModule,
    DividerModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    EmployeFormComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './employe-detail.component.html',
  styleUrls: ['./employe-detail.component.scss'],
})
export class EmployeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(EmployeService);
  private msg = inject(MessageService);
  private confirm = inject(ConfirmationService);
  private commonService = inject(CommonService);

  employe = signal<Employe | null>(null);
  loading = signal(true);
  loadError = signal<string | null>(null);
  activeTab = signal(0);

  showEditDialog = signal(false);
  fiches = signal<FicheDePaie[]>([]);
  conges = signal<Conge[]>([]);

  canWrite = this.commonService.hasRole(environment.ressourcesHumainesRoles);

  timeline = signal<TimelineEvent[]>([]);

  // Computed
  anciennete = computed(() => {
    const e = this.employe();
    if (!e) return 0;
    const diff = Date.now() - new Date(e.dateEmbauche).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  });

  totalCongesApprouves = computed(() =>
    this.conges()
      .filter((c) => c.statut === StatutConge.APPROUVE)
      .reduce((a, c) => a + c.dureeJours, 0),
  );

  salaireNetMoyen = computed(() => {
    const f = this.fiches();
    if (!f.length) return 0;
    return Math.round(f.reduce((a, c) => a + c.salaireNet, 0) / f.length);
  });

  devise = this.commonService.deviseMonnetaire();

  recuperationsParallesDesDonnees(id: string) {
    forkJoin({
      emp: this.svc.findById(id),
      fpaies: this.svc.getFichesDePaie(id),
      cong: this.svc.getConges(id),
    }).subscribe({
      next: ({ emp, fpaies, cong }) => {
        this.loading.set(false);
        this.employe.set(emp);
        this.fiches.set(fpaies);
        this.conges.set(cong);

        this.buildTimeline();
      },
      error: (err: ServiceError) => {
        this.loading.set(false);
        this.loadError.set(err.message);
      },
    });
  }
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recuperationsParallesDesDonnees(id);
    /*this.svc.findById(id).subscribe({
      next: (e) => {
        this.employe.set(e);
        this.loading.set(false);
        this.buildTimeline();
      },
      error: (err: ServiceError) => {
        this.loading.set(false);
        this.loadError.set(err.message);
      },
    });*/
  }

  private buildTimeline() {
    const events: TimelineEvent[] = [
      ...this.fiches().map((f) => ({
        date: new Date(f.annee, f.mois - 1, 28),
        icon: 'pi-wallet',
        color: '#185fa5',
        title: `Fiche de paie — ${MOIS[f.mois - 1]} ${f.annee}`,
        subtitle: `Net : ${f.salaireNet.toLocaleString()} ${this.commonService.deviseMonnetaire()}`,
        type: 'paie',
      })),
      ...this.conges().map((c) => ({
        date: new Date(c.dateDebut),
        icon: 'pi-calendar-times',
        color: '#ba7517',
        title: c.type,
        subtitle: `${c.dureeJours} jour(s) · ${c.statut}`,
        type: 'conge',
      })),
      {
        date: new Date(this.employe()!.dateEmbauche),
        icon: 'pi-briefcase',
        color: '#0f6e56',
        title: "Date d'embauche",
        subtitle: this.employe()!.poste,
        type: 'embauche',
      },
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    this.timeline.set(events);
  }

  // ── Helpers ───────────────────────────────────────────
  get initiales(): string {
    const e = this.employe();
    return e ? `${e.prenom[0]}${e.nom[0]}`.toUpperCase() : '??';
  }

  get deptLabel(): string {
    return (
      DEPARTEMENTS.find((d) => d.value === this.employe()?.departement)
        ?.label ?? ''
    );
  }

  getMoisLabel(m: number) {
    return MOIS[m - 1] ?? '';
  }

  getStatutLabel(s: string) {
    return this.commonService.getStatutLabel(s, Entite.EMPLOYE);
  }

  getCongeStatutLabel(s: string) {
    return this.commonService.getStatutLabel(s, Entite.CONGE);
  }

  getStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.EMPLOYE);
  }

  getCongeStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.CONGE);
  }

  getContratSeverity(c: string) {
    return (
      { CDI: 'success', CDD: 'info', STAGE: 'warn', VACATAIRE: 'secondary' }[
        c
      ] ?? 'secondary'
    );
  }

  getAvatarBg(): Record<string, string> {
    const map: Record<string, { bg: string; color: string }> = {
      MEDECINE: { bg: '#e6f1fb', color: '#0c447c' },
      CHIRURGIE: { bg: '#e1f5ee', color: '#085041' },
      LABORATOIRE: { bg: '#eeedfe', color: '#26215c' },
      PHARMACIE: { bg: '#faeeda', color: '#633806' },
      ADMINISTRATION: { bg: '#f1efe8', color: '#5f5e5a' },
      COMPTABILITE: { bg: '#fcebeb', color: '#791f1f' },
      INFIRMERIE: { bg: '#e6f1fb', color: '#185fa5' },
      URGENCES: { bg: '#fcebeb', color: '#a32d2d' },
    };
    const d = this.employe()?.departement ?? '';
    const s = map[d] ?? { bg: '#e6f1fb', color: '#0c447c' };
    return { background: s.bg, color: s.color };
  }

  // ── Actions ───────────────────────────────────────────
  toggleStatut() {
    const e = this.employe();
    if (!e) return;
    const nouveau = e.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    const label = nouveau === 'ACTIF' ? 'réactiver' : 'désactiver';

    this.confirm.confirm({
      header: 'Modifier le statut',
      message: `Voulez-vous ${label} ${e.prenom} ${e.nom} ?`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.svc.changeStatus(e.id, nouveau).subscribe({
          next: (updated) => {
            this.employe.set(updated);
            this.msg.add({
              severity: 'success',
              summary: 'Statut mis à jour',
              detail: `${e.prenom} ${e.nom} est maintenant ${nouveau === 'ACTIF' ? 'actif' : 'inactif'}.`,
            });
          },
          error: (err: ServiceError) => {
            this.msg.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message,
              life: 5000,
            });
          },
        });
      },
    });
  }

  onFormSaved(updated: Employe) {
    this.employe.set(updated);
    this.showEditDialog.set(false);
    this.msg.add({
      severity: 'success',
      summary: 'Mis à jour',
      detail: 'Fiche employé mise à jour.',
    });
  }

  onFormError(err: ServiceError) {
    this.msg.add({
      severity: 'error',
      summary: 'Erreur',
      detail: err.message,
      life: 5000,
    });
  }

  copierId() {
    navigator.clipboard.writeText(this.employe()?.id ?? '');
    this.msg.add({
      severity: 'info',
      summary: 'Copié',
      detail: 'ID employé copié.',
      life: 2000,
    });
  }

  imprimerFiche() {
    window.print();
  }
}
