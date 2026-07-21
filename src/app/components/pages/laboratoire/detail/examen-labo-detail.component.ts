import { Entite } from './../../../../core/models/enums/enums.model';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';

import { CommonService } from '../../../../core/services/common.services';
import { AppConfirmationService } from '../../../../core/services/global/app.confirmation.service';
import { ServiceError } from '../../../../core/models/all/all.model';
import { StatutExamenLabo } from '../../../../core/models/enums/enums.model';
import {
  ExamenLabo,
  EXAMEN_STATUT_CONFIG,
} from '../../../../core/models/laboratoire/laboratoire.model';
import { ExamenLaboService } from '../../../../core/services/laboratoire/laboratoire.service';
import { ResultatLaboService } from '../../../../core/services/laboratoire/resultat.labo.service';
import { ResultatLabo } from '../../../../core/models/laboratoire/resultat.labo.model';
import { ResultatLaboComponent } from '../resultat/resultat-labo.component';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'clnt-examen-labo-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TagModule,
    SkeletonModule,
    ToastModule,
    TooltipModule,
    DividerModule,
    ConfirmDialogModule,
    ResultatLaboComponent,
  ],
  providers: [MessageService, AppConfirmationService],
  templateUrl: './examen-labo-detail.component.html',
  styleUrls: ['./examen-labo-detail.component.scss'],
})
export class ExamenLaboDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ExamenLaboService);
  private commonSvc = inject(CommonService);
  private msgSvc = inject(MessageService);
  private confirmSvc = inject(AppConfirmationService);
  private auth = inject(AuthService);
  private resultatSvc = inject(ResultatLaboService);
  private commonService = inject(CommonService);

  // ── État ─────────────────────────────────────────────────
  examen = signal<ExamenLabo | null>(null);
  resultat = signal<ResultatLabo | null>(null);
  loading = signal(true);
  loadError = signal<string | null>(null);
  saving = signal(false);
  canEdit = signal(false);
  currentUserId = signal<string>('');

  onResultatSaved(r: ResultatLabo): void {
    // Optionnel : mettre à jour le statut local si besoin
    this.examen.update((e) => (e ? { ...e, dateResultat: r.createdAt } : e));
  }

  onResultatLoaded(r: ResultatLabo | null): void {
    this.resultat.set(r);
  }

  // Options de statut pour le changement rapide
  statutOptions = Object.entries(EXAMEN_STATUT_CONFIG).map(([value, cfg]) => ({
    label: cfg.label,
    value: value as StatutExamenLabo,
    severity: cfg.severity,
    icon: cfg.icon,
  }));

  readonly statutConfig = EXAMEN_STATUT_CONFIG;

  // ── Init ─────────────────────────────────────────────────
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadExamen(id);
    this.currentUserId.set(this.auth.currentUser()?.id ?? '');
    this.canEdit.set(this.commonService.autorizedLaborantins());
  }

  private loadExamen(id: string): void {
    this.loading.set(true);
    this.svc.findById(id).subscribe({
      next: (e) => {
        this.examen.set(e);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set('Examen introuvable.');
        this.msgSvc.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Examen de laboratoire introuvable.',
        });
      },
    });
  }

  // ── Changement de statut ─────────────────────────────────
  changeStatut(statut: StatutExamenLabo): void {
    const e = this.examen();
    if (!e || e.statut === statut) return;

    this.saving.set(true);
    this.svc.changeStatut(e.id, statut).subscribe({
      next: (updated) => {
        this.examen.set(updated);
        this.saving.set(false);
        this.msgSvc.add({
          severity: 'success',
          summary: 'Statut mis à jour',
          detail: `Examen marqué comme "${EXAMEN_STATUT_CONFIG[statut].label}".`,
        });
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.msgSvc.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message,
        });
      },
    });
  }

  // ── Suppression ──────────────────────────────────────────
  confirmDelete(): void {
    const e = this.examen();
    if (!e) return;
    this.confirmSvc.action(
      "Suppression de l'examen",
      `Supprimer l'examen "${e.typeExamen}" ? Cette action est irréversible.`,
      () => {
        this.svc.delete(e.id).subscribe({
          next: () => {
            this.msgSvc.add({
              severity: 'success',
              summary: 'Supprimé',
              detail: 'Examen supprimé avec succès.',
            });
            setTimeout(() => this.router.navigate(['/examens-labo']), 1200);
          },
          error: () =>
            this.msgSvc.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer cet examen.',
            }),
        });
      },
    );
  }

  // ── Helpers ──────────────────────────────────────────────
  getStatutLabel(s: string): string {
    return this.commonSvc.getStatutLabel(s, Entite.LABORATOIRE);
  }

  getStatutSeverity(s: string) {
    return this.commonSvc.getStatutSeverity(s, Entite.LABORATOIRE);
  }

  getStatutIcon(s: string): string {
    return this.commonSvc.getStatutIcon(s, Entite.LABORATOIRE);
  }

  getStatutColorClass(s: string): string {
    return this.commonSvc.getStatutColorClass(s);
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return this.commonSvc.formatDate(iso);
  }

  formatDatetime(iso: string | null): string {
    return this.commonSvc.formatDatetime(iso);
  }

  isEditable(): boolean {
    const s = this.examen()?.statut;
    return s === StatutExamenLabo.EN_ATTENTE || s === StatutExamenLabo.EN_COURS;
  }

  changeStatus(): boolean {
    const s = this.examen()?.statut;
    return s != StatutExamenLabo.ANNULE;
  }

  showResults(): boolean {
    const s = this.examen()?.statut;
    return s === StatutExamenLabo.TERMINE;
  }

  genererPdf(): void {
    const e = this.examen();
    const r = this.resultat();
    console.log('examen:', e);
    console.log('resultat:', r); // null ici = problème de chargement
    if (!e) return;
    this.svc.genererRapportPdf({ ...e, resultat: r });
  }
}
