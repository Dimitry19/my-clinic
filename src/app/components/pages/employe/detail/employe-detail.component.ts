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
} from '../../../../core/models/employe/employe.model';
import {
  EmployeService,
  ServiceError,
} from '../../../../core/services/employe/employe.service';
import { EmployeFormComponent } from '../formulaire/employe-form.component';

interface FicheDePaie {
  id: string;
  mois: number;
  annee: number;
  salaireBrut: number;
  cotisations: number;
  primes: number;
  retenues: number;
  salaireNet: number;
  pdfPath?: string;
}

interface Conge {
  id: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  motif?: string;
  dureeJours: number;
}

interface TimelineEvent {
  date: Date;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  type: string;
}

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

  employe = signal<Employe | null>(null);
  loading = signal(true);
  loadError = signal<string | null>(null);
  activeTab = signal(0);

  showEditDialog = signal(false);

  // Données simulées — à remplacer par de vrais appels API
  fiches = signal<FicheDePaie[]>([
    {
      id: '1',
      mois: 5,
      annee: 2026,
      salaireBrut: 30000,
      cotisations: 2700,
      primes: 2000,
      retenues: 500,
      salaireNet: 28800,
    },
    {
      id: '2',
      mois: 4,
      annee: 2026,
      salaireBrut: 30000,
      cotisations: 2700,
      primes: 0,
      retenues: 0,
      salaireNet: 27300,
    },
    {
      id: '3',
      mois: 3,
      annee: 2026,
      salaireBrut: 30000,
      cotisations: 2700,
      primes: 3000,
      retenues: 0,
      salaireNet: 30300,
    },
    {
      id: '4',
      mois: 2,
      annee: 2026,
      salaireBrut: 30000,
      cotisations: 2700,
      primes: 0,
      retenues: 1000,
      salaireNet: 26300,
    },
  ]);

  conges = signal<Conge[]>([
    {
      id: '1',
      type: 'Congé annuel',
      dateDebut: '2026-04-14',
      dateFin: '2026-04-21',
      statut: 'APPROUVE',
      dureeJours: 7,
    },
    {
      id: '2',
      type: 'Congé maladie',
      dateDebut: '2026-02-03',
      dateFin: '2026-02-05',
      statut: 'APPROUVE',
      dureeJours: 3,
      motif: 'Grippe',
    },
    {
      id: '3',
      type: 'Congé familial',
      dateDebut: '2026-06-15',
      dateFin: '2026-06-17',
      statut: 'EN_ATTENTE',
      dureeJours: 3,
    },
  ]);

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
      .filter((c) => c.statut === 'APPROUVE')
      .reduce((a, c) => a + c.dureeJours, 0),
  );

  salaireNetMoyen = computed(() => {
    const f = this.fiches();
    if (!f.length) return 0;
    return Math.round(f.reduce((a, c) => a + c.salaireNet, 0) / f.length);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.findById(id).subscribe({
      next: (e) => {
        this.employe.set(e);
        this.loading.set(false);
        this.buildTimeline();
      },
      error: (err: ServiceError) => {
        this.loading.set(false);
        this.loadError.set(err.message);
      },
    });
  }

  private buildTimeline() {
    const events: TimelineEvent[] = [
      ...this.fiches().map((f) => ({
        date: new Date(f.annee, f.mois - 1, 28),
        icon: 'pi-wallet',
        color: '#185fa5',
        title: `Fiche de paie — ${MOIS[f.mois - 1]} ${f.annee}`,
        subtitle: `Net : ${f.salaireNet.toLocaleString()} FCFA`,
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

  getStatutSeverity(s: string) {
    return (
      { ACTIF: 'success', INACTIF: 'danger', SUSPENDU: 'warn' }[s] ??
      'secondary'
    );
  }

  getContratSeverity(c: string) {
    return (
      { CDI: 'success', CDD: 'info', STAGE: 'warn', VACATAIRE: 'secondary' }[
        c
      ] ?? 'secondary'
    );
  }

  getCongeStatutSeverity(s: string) {
    return (
      { APPROUVE: 'success', EN_ATTENTE: 'warn', REJETE: 'danger' }[s] ??
      'secondary'
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
