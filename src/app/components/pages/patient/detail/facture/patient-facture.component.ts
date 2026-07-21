import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { TooltipModule } from 'primeng/tooltip';

import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Page, ServiceError } from '../../../../../core/models/all/all.model';
import { Configuration } from '../../../../../core/models/configuration/configuration.model';
import {
  StatutFacture,
  Entite,
} from '../../../../../core/models/enums/enums.model';
import {
  Facture,
  FACTURE_STATUT_CONFIG,
  StatutFactureRequest,
} from '../../../../../core/models/facture/facture.model';
import { Consultation } from '../../../../../core/models/patient/consultation.model';
import { Patient } from '../../../../../core/models/patient/patient.model';
import { CommonService } from '../../../../../core/services/common.services';
import { FactureService } from '../../../../../core/services/facture/facture.service';
import { AppConfirmationService } from '../../../../../core/services/global/app.confirmation.service';
import { PaiementAddComponent } from '../../../facture/paiement/paiement-add.component';
import { FactureStatutComponent } from '../../../facture/statut/facture-statut.component';

@Component({
  selector: 'clnt-patient-detail-facture',
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
    FormsModule,
    InputTextModule,
    AvatarModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    SelectModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    ConfirmDialogModule,
    PaiementAddComponent,
    FactureStatutComponent,
  ],
  providers: [AppConfirmationService],
  templateUrl: './patient-facture.component.html',
  styleUrls: ['./patient-facture.component.scss'],
})
export class PatientFactureComponent implements OnInit {
  private commonService = inject(CommonService);

  private confirmService = inject(AppConfirmationService);
  private factureSvc = inject(FactureService);
  private msgService = inject(MessageService);

  facturesCount = output<number>();
  soldeChange = output<number>();

  patient = input<Patient | null>(null);
  loadError = signal<string | null>(null);
  loading = signal(true);

  activeTab = signal(0);
  readonly pageSize = Configuration.pageSize;

  private destroyFact$ = new Subject<void>();
  loadingFactures = signal(true);
  pageFact = signal<Page<Facture> | null>(null);
  pageFactIndex = signal(0);
  factures = signal<Facture[]>([]);

  addPayment = signal(false);
  selectedFactureId = signal<string | null>(null);

  totalFactures = computed(() => this.pageFact()?.page.totalElements ?? 0);
  selectedFacture = computed(() =>
    this.facturesFiltrees().find((f) => f.id === this.selectedFactureId()),
  );

  totalMontant = computed(() =>
    this.facturesFiltrees().reduce(
      (total, f) => total + (f.montantTotal ?? 0),
      0,
    ),
  );

  totalPaye = computed(() =>
    this.facturesFiltrees().reduce(
      (total, f) => total + (f.montantPaye ?? 0),
      0,
    ),
  );

  totalReste = computed(() =>
    this.facturesFiltrees().reduce(
      (total, f) => total + (f.resteAPayer ?? 0),
      0,
    ),
  );

  statutOptions = [
    { label: 'Tous les statuts', value: null },
    ...Object.entries(FACTURE_STATUT_CONFIG).map(([value, cfg]) => ({
      label: cfg.label,
      value: value as StatutFacture,
    })),
  ];

  // ── Filtres ───────────────────────────────────────────────
  filtreNumero = signal('');
  filtreDate = signal<Date | null>(null);
  filtreStatut = signal<StatutFacture | null>(null);

  // Sujet pour debounce des filtres texte
  private filtreNumero$ = new Subject<string>();

  // ── Dialog Facture ────────────────────────────────────────
  showDetailFacture = signal(false);

  // ── Dialog détail Facture
  showDetailFact = signal(false);
  detailFacture = signal<Facture | null>(null);
  statutFactOptions = Object.entries(FACTURE_STATUT_CONFIG).map(([v, c]) => ({
    label: c.label,
    value: v,
  }));

  statutFactConfig = FACTURE_STATUT_CONFIG;

  selectedRdv = signal<Consultation | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  timeline = signal<any[]>([]);
  devise = this.commonService.deviseMonnetaire();

  ngOnInit() {
    this.filtreNumero$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroyFact$),
      )
      .subscribe((v) => {
        this.filtreNumero.set(v);
        this.pageFactIndex.set(0);
        this.loadFactures();
      });

    this.loadFactures();
  }

  ngOnDestroy() {
    this.destroyFact$.next();
    this.destroyFact$.complete();
  }

  get soldeDu(): number {
    return this.factures()
      .filter((f) => f.statut !== StatutFacture.PAYEE)
      .reduce((acc, f) => acc + (f.montantTotal - f.montantPaye), 0);
  }

  getSexeLabel(s: string) {
    return this.commonService.getSexeLabel(s);
  }

  getFactureSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.FACTURATION);
  }
  getStatutIcon(s: string): string {
    return this.commonService.getStatutIcon(s, Entite.FACTURATION);
  }
  getExamenSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.LABORATOIRE);
  }

  copierId() {
    navigator.clipboard.writeText(this.patient()?.id ?? '');
    this.msgService.add({
      severity: 'info',
      summary: 'Copié',
      detail: 'ID patient copié.',
      life: 2000,
    });
  }

  imprimerFiche() {
    window.print();
  }

  //------------------FACTURES---------------------------

  changeFactureStatus(req: StatutFactureRequest) {
    const factId = req.factureId;
    const statut = req.statut;
    this.selectedFactureId.set(factId);

    const facture = this.selectedFacture()!;

    if (
      (facture.statut === StatutFacture.PARTIELLEMENT_PAYEE &&
        (statut === StatutFacture.IMPAYEE ||
          statut === StatutFacture.ANNULEE)) ||
      (facture.resteAPayer === 0 &&
        (statut === StatutFacture.PARTIELLEMENT_PAYEE ||
          statut === StatutFacture.ANNULEE))
    ) {
      this.msgService.add({
        severity: 'error',
        summary: 'Action impossible',
        detail: `Impossible de changer le statut de la facture ${facture.numeroFacture} vers ${FACTURE_STATUT_CONFIG[statut].label}.`,
      });
      return;
    }
    this.factureSvc.changeStatut(factId, statut).subscribe({
      next: () => {
        this.factures.update((list) =>
          list.map((r) => (r.id === factId ? { ...r, statut } : r)),
        );
        if (this.detailFacture()?.id === factId) {
          this.detailFacture.set({ ...this.selectedFacture()!, statut });
          this.msgService.add({
            severity: 'success',
            summary: 'Statut mis à jour',
            detail: `Facture ${this.selectedFacture()?.numeroFacture} → ${FACTURE_STATUT_CONFIG[statut].label}`,
          });
        }
        this.loadFactures(this.pageFactIndex());
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.loading.set(false);
        this.loadError.set(err.message);
      },
    });
  }
  onLazyLoadFactures(e: any) {
    this.pageFactIndex.set(e.first / this.pageSize);
    this.loadFactures(this.pageFactIndex());
  }

  loadFactures(p = 0) {
    this.loadingFactures.set(true);

    this.factureSvc
      .findByPatient(
        this.patient()!.id,
        p,
        this.pageSize,
        this.filtreStatut() ?? undefined,
      )
      .pipe(takeUntil(this.destroyFact$))
      .subscribe({
        next: (page) => {
          this.successLoadFactures(page);
        },
        error: (e: ServiceError) => {
          this.loadingFactures.set(false);
        },
      });
  }

  successLoadFactures(data: Page<Facture>) {
    this.pageFact.set(data);
    this.factures.set(data.content);
    this.loadingFactures.set(false);
    this.facturesCount.emit(data.content.length);
    this.soldeChange.emit(this.soldeDu);
  }

  editableFacture(fact: Facture): boolean {
    if (!fact) return false;
    return (
      fact.statut != StatutFacture.PAYEE && fact.statut != StatutFacture.ANNULEE
    );
  }

  confirmDeleteFacture(fact: Facture) {
    this.confirmService.action(
      `Suppression de la facture`,
      `Supprimer la facture de  ${fact.patientNom} numéro ${fact.numeroFacture}?`,
      () => {
        this.factureSvc.delete(fact.id).subscribe(() => {
          this.msgService.add({
            severity: 'success',
            summary: 'Supprimée',
            detail: 'Facture supprimée.',
          });
          this.loadFactures(0);
        });
      },
    );
  }

  retryLoadFactures() {
    this.loadFactures(this.pageFactIndex());
  }
  openFactureDetails(fact: Facture) {
    this.detailFacture.set(fact);
    this.showDetailFacture.set(true);
  }

  ajouterPaiement(fact: Facture) {
    this.detailFacture.set(fact);
    this.addPayment.set(true);
  }

  getFactureStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.FACTURATION);
  }

  hasFiltre = computed(
    () => !!this.filtreNumero() || !!this.filtreDate() || !!this.filtreStatut(),
  );

  // ── Filtres Factures ───────────────────────────────────────────────
  onFiltreNumero(v: string) {
    this.filtreNumero$.next(v);
  }
  onFiltreStatut(v: StatutFacture | null) {
    this.filtreStatut.set(v);
    this.pageFactIndex.set(0);
    this.loadFactures();
  }

  onFiltreDate(v: Date | null) {
    this.filtreDate.set(v);
    this.pageFactIndex.set(0);
    this.loadFactures();
  }

  clearFilters() {
    this.filtreNumero.set('');
    this.filtreDate.set(null);
    this.filtreStatut.set(null);
    this.pageFactIndex.set(0);
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

  debounceFiltreNumero() {
    this.filtreNumero$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroyFact$),
      )
      .subscribe((v) => {
        this.filtreNumero.set(v);
        this.pageFactIndex.set(0);
        this.loadFactures();
      });
  }

  formatDate(iso: string) {
    return this.commonService.formatDate(iso);
  }
  formatHeure(iso: string) {
    return this.commonService.formatHeure(iso);
  }

  getFactureStatutLabel(s: string) {
    return this.commonService.getStatutLabel(s, Entite.FACTURATION);
  }

  getInitiales(prenom: string, nom: string): string {
    return this.commonService.getInitiales(prenom, nom);
  }

  genererFacturePdf(facture: Facture) {
    this.factureSvc.genererPdf(facture);
  }

  deviseMonnetaire(): string {
    return this.commonService.deviseMonnetaire();
  }

  submitPaiement(data: any) {
    console.log('Paiement reçu:', data);
    if (!data) return;

    this.factureSvc.ajouterPaiement(data).subscribe({
      next: (updated) => {
        this.detailFacture.set(updated);
        this.addPayment.set(false);

        this.msgService.add({
          severity: 'success',
          summary: 'Paiement enregistré',
          detail: `${data.montant.toLocaleString('fr-FR')} ${this.commonService.deviseMonnetaire()} encaissés.`,
        });
        this.loadFactures();
      },
      error: (err: ServiceError) => {
        this.msgService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message,
        });
      },
    });
  }
}
