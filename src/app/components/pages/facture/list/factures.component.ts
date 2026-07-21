import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { Popover, PopoverModule } from 'primeng/popover';
import { InputIconModule } from 'primeng/inputicon';

import { CommonService } from '../../../../core/services/common.services';
import { AppConfirmationService } from '../../../../core/services/global/app.confirmation.service';
import { ServiceError } from '../../../../core/models/all/all.model';
import { Configuration } from '../../../../core/models/configuration/configuration.model';
import {
  Entite,
  StatutFacture,
} from '../../../../core/models/enums/enums.model';
import {
  Facture,
  FACTURE_STATUT_CONFIG,
} from '../../../../core/models/facture/facture.model';
import { FactureService } from '../../../../core/services/facture/facture.service';
import { IconFieldModule } from 'primeng/iconfield';

@Component({
  selector: 'clnt-facture-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule,
    SelectModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    PopoverModule,
  ],
  providers: [MessageService, AppConfirmationService],
  templateUrl: './factures.component.html',
  styleUrls: ['./factures.component.scss'],
})
export class FacturesComponent implements OnInit, OnDestroy {
  private svc = inject(FactureService);
  private msg = inject(MessageService);
  private commonSvc = inject(CommonService);
  private confirmSvc = inject(AppConfirmationService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  @ViewChild('statutPopover') statutPopover!: Popover;

  // ── État ─────────────────────────────────────────────────
  factures = signal<Facture[]>([]);
  factureSelectionnee = signal<Facture | null>(null);
  total = signal(0);
  loading = signal(true);
  saving = signal(false);
  page = signal(0);
  readonly pageSize = Configuration.pageSize;

  // ── Filtres ───────────────────────────────────────────────
  filtreNumero = signal('');
  filtrePatient = signal('');
  filtreDate = signal<Date | null>(null);
  filtreStatut = signal<StatutFacture | null>(null);

  // Sujet pour debounce des filtres texte
  private filtreNumero$ = new Subject<string>();
  private filtrePatient$ = new Subject<string>();

  // ── Options statut ────────────────────────────────────────
  readonly statutConfig = FACTURE_STATUT_CONFIG;

  statutOptions = [
    { label: 'Tous les statuts', value: null },
    ...Object.entries(FACTURE_STATUT_CONFIG).map(([value, cfg]) => ({
      label: cfg.label,
      value: value as StatutFacture,
    })),
  ];

  statutActionsOptions = Object.entries(FACTURE_STATUT_CONFIG).map(
    ([value, cfg]) => ({
      label: cfg.label,
      value: value as StatutFacture,
      severity: cfg.severity,
      icon: cfg.icon,
    }),
  );

  // ── Computed ──────────────────────────────────────────────
  hasFiltre = computed(
    () =>
      !!this.filtreNumero() ||
      !!this.filtrePatient() ||
      !!this.filtreDate() ||
      !!this.filtreStatut(),
  );

  // ── Init ─────────────────────────────────────────────────
  ngOnInit() {
    // Debounce sur les filtres texte
    this.filtreNumero$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((v) => {
        this.filtreNumero.set(v);
        this.page.set(0);
        this.loadFactures();
      });

    this.filtrePatient$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((v) => {
        this.filtrePatient.set(v);
        this.page.set(0);
        this.loadFactures();
      });

    this.loadFactures();
  }

  loadFactures() {
    this.loading.set(true);
    this.svc
      .findAll(this.page(), this.pageSize, this.filtreStatut() ?? undefined)
      .subscribe({
        next: (p) => {
          this.factures.set(p.content);
          this.total.set(p.page.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les factures.',
          });
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.page.set((event.first ?? 0) / this.pageSize);
    this.loadFactures();
  }

  // ── Filtres ───────────────────────────────────────────────
  onFiltreNumero(v: string) {
    this.filtreNumero$.next(v);
  }
  onFiltrePatient(v: string) {
    this.filtrePatient$.next(v);
  }

  onFiltreStatut(v: StatutFacture | null) {
    this.filtreStatut.set(v);
    this.page.set(0);
    this.loadFactures();
  }

  onFiltreDate(v: Date | null) {
    this.filtreDate.set(v);
    this.page.set(0);
    this.loadFactures();
  }

  clearFilters() {
    this.filtreNumero.set('');
    this.filtrePatient.set('');
    this.filtreDate.set(null);
    this.filtreStatut.set(null);
    this.page.set(0);
    this.loadFactures();
  }

  // ── Factures filtrées côté client (numero, patient, date) ─
  // Le filtreStatut est envoyé au backend, les autres sont filtrés
  // localement sur les données déjà chargées
  facturesFiltrees = computed(() => {
    let data = this.factures();

    if (this.filtreNumero()) {
      const q = this.filtreNumero().toLowerCase();
      data = data.filter((f) => f.numeroFacture.toLowerCase().includes(q));
    }

    if (this.filtrePatient()) {
      const q = this.filtrePatient().toLowerCase();
      data = data.filter((f) => f.patientNom.toLowerCase().includes(q));
    }

    if (this.filtreDate()) {
      const d = this.filtreDate()!;
      data = data.filter((f) => {
        const fd = new Date(f.dateEmission);
        return (
          fd.getFullYear() === d.getFullYear() &&
          fd.getMonth() === d.getMonth() &&
          fd.getDate() === d.getDate()
        );
      });
    }

    return data;
  });

  // ── Changement de statut ──────────────────────────────────
  changeStatut(facture: Facture, statut: StatutFacture) {
    if (facture.statut === statut) return;

    if (
      (facture.statut === StatutFacture.PARTIELLEMENT_PAYEE &&
        (statut === StatutFacture.IMPAYEE ||
          statut === StatutFacture.ANNULEE)) ||
      (facture.resteAPayer === 0 &&
        (statut === StatutFacture.PARTIELLEMENT_PAYEE ||
          statut === StatutFacture.ANNULEE))
    ) {
      this.msg.add({
        severity: 'error',
        summary: 'Action impossible',
        detail: `Impossible de changer le statut de la facture ${facture.numeroFacture} vers ${FACTURE_STATUT_CONFIG[statut].label}.`,
      });
      return;
    }

    this.saving.set(true);
    this.svc.changeStatut(facture.id, statut).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.factures.update((list) =>
          list.map((f) => (f.id === updated.id ? updated : f)),
        );
        this.msg.add({
          severity: 'success',
          summary: 'Statut mis à jour',
          detail: `Facture ${facture.numeroFacture} → ${FACTURE_STATUT_CONFIG[statut].label}`,
        });
        this.loadFactures();
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message,
        });
      },
    });
  }

  // ── Suppression ───────────────────────────────────────────
  confirmDelete(facture: Facture) {
    this.confirmSvc.action(
      'Supprimer la facture',
      `Supprimer la facture ${facture.numeroFacture} de ${facture.patientNom} ? Cette action est irréversible.`,
      () =>
        this.svc.delete(facture.id).subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Supprimée',
              detail: `Facture ${facture.numeroFacture} supprimée.`,
            });
            this.loadFactures();
          },
          error: (err: ServiceError) =>
            this.msg.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message,
            }),
        }),
    );
  }

  openStatutMenu(facture: Facture, event: Event) {
    this.factureSelectionnee.set(facture);
    this.statutPopover.toggle(event);
  }

  // ── PDF ───────────────────────────────────────────────────
  genererPdf(facture: Facture) {
    this.svc.genererPdf(facture);
  }

  // ── Helpers ───────────────────────────────────────────────
  getStatutLabel(s: string): string {
    return this.commonSvc.getStatutLabel(s, Entite.FACTURATION);
  }

  getStatutSeverity(s: string) {
    return this.commonSvc.getStatutSeverity(s, Entite.FACTURATION);
  }

  getStatutIcon(s: string): string {
    return this.commonSvc.getStatutIcon(s, Entite.FACTURATION);
  }

  formatDate(iso: string): string {
    return this.commonSvc.formatDate(iso);
  }

  formatMontant(v: number): string {
    return `${(v ?? 0).toLocaleString('fr-FR')} FCFA`;
  }

  isModifiable(f: Facture): boolean {
    return f.statut !== 'PAYEE' && f.statut !== 'ANNULEE';
  }

  isSupprimable(f: Facture): boolean {
    return f.statut !== 'PAYEE';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Note: ajouter ces éléments dans le composant

// ── Popover statut ────────────────────────────────────────
// import { Popover } from 'primeng/popover'; — ajouter dans imports
// @ViewChild('statutPopover') statutPopover!: Popover;

// factureSelectionnee = signal<Facture | null>(null);

// openStatutMenu(facture: Facture, event: Event) {
//   this.factureSelectionnee.set(facture);
//   this.statutPopover.toggle(event);
// }
