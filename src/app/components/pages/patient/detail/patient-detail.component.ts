import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
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
import type { ButtonSeverity } from 'primeng/button';

import { PatientService } from '../../../../core/services/patient/patient.service';

import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../../core/services/common.services';
import { Patient } from '../../../../core/models/patient/patient.model';
import {
  Entite,
  StatutFacture,
} from '../../../../core/models/enums/enums.model';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { Page, ServiceError } from '../../../../core/models/all/all.model';
import { ConsultationService } from '../../../../core/services/patient/consultation.service';
import { Configuration } from '../../../../core/models/configuration/configuration.model';
import {
  CONS_STATUT_CONFIG,
  Consultation,
  StatutConsultation,
} from '../../../../core/models/patient/consultation.model';
import { AppConfirmationService } from '../../../../core/services/global/app.confirmation.service';
import { ExamenLabo } from '../../../../core/models/laboratoire/laboratoire.model';
import { ExamenLaboService } from '../../../../core/services/laboratoire/laboratoire.service';
import { OrdonnanceService } from '../../../../core/services/ordonnance/ordonnance.service';
import { Ordonnance } from '../../../../core/models/ordonnance/ordonnance.model';
import {
  Facture,
  FACTURE_STATUT_CONFIG,
} from '../../../../core/models/facture/facture.model';
import { FactureService } from '../../../../core/services/facture/facture.service';
import { PaiementAddComponent } from '../../facture/paiement/paiement-add.component';

@Component({
  selector: 'clnt-patient-detail',
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
    TooltipModule,
    DialogModule,
    ConfirmDialogModule,
    PaiementAddComponent,
  ],
  providers: [MessageService, AppConfirmationService],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientSvc = inject(PatientService);
  private consultationSvc = inject(ConsultationService);
  private examenLaboSvc = inject(ExamenLaboService);
  private commonService = inject(CommonService);
  private ordonnanceSvc = inject(OrdonnanceService);
  private confirmService = inject(AppConfirmationService);
  private factureSvc = inject(FactureService);
  private msgSvc = inject(MessageService);

  patient = signal<Patient | null>(null);
  loadError = signal<string | null>(null);
  loading = signal(true);

  activeTab = signal(0);
  readonly pageSize = Configuration.pageSize;

  // --Examens

  private destroyExams$ = new Subject<void>();
  loadingExams = signal(true);
  pageExams = signal<Page<ExamenLabo> | null>(null);
  pageExamsIndex = signal(0);
  examens = signal<ExamenLabo[]>([]);
  totalExams = computed(() => this.pageExams()?.page.totalElements ?? 0);

  // --Consultations
  private destroyCons$ = new Subject<void>();
  loadingCons = signal(true);
  pageCons = signal<Page<Consultation> | null>(null);
  pageConsIndex = signal(0);
  consultations = signal<Consultation[]>([]);
  totalConsultations = computed(() => this.pageCons()?.page.totalElements ?? 0);
  // ── Dialog Consultation ────────────────────────────────────────
  showDetailConsultation = signal(false);

  // ── Dialog détail Consultation─────────────────────────────────────
  showDetail = signal(false);
  detailConsultation = signal<Consultation | null>(null);

  statutConsOptions = Object.entries(CONS_STATUT_CONFIG).map(([v, c]) => ({
    label: c.label,
    value: v,
  }));
  statutConsConfig = CONS_STATUT_CONFIG;

  // Ordonnances
  private destroyOrd$ = new Subject<void>();
  loadingOrdonnances = signal(true);
  ordonnances = signal<Ordonnance[]>([]);

  // Factures
  private destroyFact$ = new Subject<void>();
  loadingFactures = signal(true);
  pageFact = signal<Page<Facture> | null>(null);
  pageFactIndex = signal(0);
  factures = signal<Facture[]>([]);
  totalFactures = computed(() => this.pageFact()?.page.totalElements ?? 0);
  addPayment = signal(false);

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

  recuperationsParallesDesDonnees(page: number, id: string) {
    forkJoin({
      p: this.patientSvc.findById(id),
      ords: this.ordonnanceSvc.findByPatient(id),
      //cons: this.consultationSvc.findAllByPatient(page, this.pageSize, id),
      //exams: this.examenLaboSvc.findByPatient(id, page, this.pageSize),
      //cong: this.svc.getConges(id),
    }).subscribe({
      next: ({ p, ords }) => {
        this.patient.set(p);
        this.loading.set(false);
        this.successLoadOrdonnances(ords);
        // this.successLoadConsultation(cons);
        // this.successLoadExamens(exams);
        //this.conges.set(cong);
      },
      error: (err: ServiceError) => {
        this.loading.set(false);
        //this.loadingCons.set(false);
        // this.loadingExams.set(false);
        this.loadingOrdonnances.set(false);

        this.loadError.set(err.message);
      },
    });
  }
  ngOnInit() {
    const patientId = this.route.snapshot.paramMap.get('id')!;
    this.recuperationsParallesDesDonnees(0, patientId);
  }

  ngOnDestroy() {
    this.destroyCons$.next();
    this.destroyCons$.complete();
    this.destroyExams$.next();
    this.destroyExams$.complete();
    this.destroyOrd$.next();
    this.destroyOrd$.complete();
    this.destroyFact$.next();
    this.destroyFact$.complete();
  }

  private buildTimeline() {
    const events = [
      ...this.consultations().map((c) => ({
        date: new Date(c.dateHeure),
        icon: 'ti ti-stethoscope',
        color: '#185FA5',
        title: c.motif,
        subtitle: c.medecinNom,
        type: 'consultation',
      })),
      ...this.examens().map((e) => ({
        date: new Date(e.datePrescription),
        icon: 'ti ti-flask',
        color: '#0F6E56',
        title: e.typeExamen,
        subtitle: this.getExamenStatutLabel(e.statut) ?? 'En attente',
        type: 'examen',
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    this.timeline.set(events);
  }

  get age(): number {
    const p = this.patient();
    if (!p) return 0;
    const diff = Date.now() - new Date(p.dateNaissance).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  get initiales(): string {
    const p = this.patient();
    return p ? this.commonService.getInitiales(p.prenom, p.nom) : '??';
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

  getExamenSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.LABORATOIRE);
  }

  copierId() {
    navigator.clipboard.writeText(this.patient()?.id ?? '');
    this.msgSvc.add({
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

  changeFactureStatus(fact: Facture, statut: StatutFacture) {
    this.factureSvc.changeStatut(fact.id, statut).subscribe({
      next: () => {
        this.factures.update((list) =>
          list.map((r) => (r.id === fact.id ? { ...r, statut } : r)),
        );
        if (this.detailFacture()?.id === fact.id)
          this.detailFacture.set({ ...fact, statut });
        this.msgSvc.add({
          severity: 'success',
          summary: 'Statut mis à jour',
          detail: `Facture marquée comme ${FACTURE_STATUT_CONFIG[statut].label}.`,
        });
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
      .findByPatient(this.patient()!.id, p, this.pageSize)
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
          this.msgSvc.add({
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

  soumettrePaiement(data: any) {
    console.log('Paiement reçu:', data);
    if (!data) return;

    this.factureSvc.ajouterPaiement(data).subscribe({
      next: (updated) => {
        this.detailFacture.set(updated);

        this.addPayment.set(false);

        this.msgSvc.add({
          severity: 'success',
          summary: 'Paiement enregistré',
          detail: `${data.montant.toLocaleString('fr-FR')} FCFA encaissés.`,
        });
        this.loadFactures();
      },
      error: (err: ServiceError) => {
        this.msgSvc.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message,
        });
      },
    });
  }
  //------------------ORDONNANCES---------------------------

  loadOrdonnances() {
    this.loadingOrdonnances.set(true);

    this.ordonnanceSvc
      .findByPatient(this.patient()!.id)
      .pipe(takeUntil(this.destroyOrd$))
      .subscribe({
        next: (data) => {
          this.successLoadOrdonnances(data);
        },
        error: (e: ServiceError) => {
          this.loadingOrdonnances.set(false);
        },
      });
  }
  successLoadOrdonnances(data: Ordonnance[]) {
    this.ordonnances.update((current) => [...current, ...data]);
    this.loadingOrdonnances.set(false);
  }

  confirmDeleteOrdonnance(o: Ordonnance) {
    this.confirmService.action(
      `Suppression de l'ordonnance`,
      `Supprimer de l'ordonnance donc la date d'emission est ${this.formatDate(o.dateEmission)} du patient ${o.patientNom} ?`,
      () => {
        this.ordonnanceSvc.delete(o.id).subscribe({
          next: () => {
            this.ordonnances.update((list) =>
              list.filter((r) => r.id !== o.id),
            );
            this.msgSvc.add({
              severity: 'success',
              summary: 'Supprimé',
              detail: 'Ordonnance supprimée.',
            });
            this.loadOrdonnances();
          },
          error: (err: ServiceError) => {
            this.msgSvc.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message,
              life: 5000,
            });
          },
        });
      },
    );
  }
  //------------------EXAMENS---------------------------
  successLoadExamens(data: Page<ExamenLabo>) {
    this.pageExams.set(data);
    this.examens.set(data.content);
    this.loadingExams.set(false);
    //this.buildTimeline();
  }

  onLazyLoadExamens(e: any) {
    this.pageExamsIndex.set(e.first / this.pageSize);
    this.loadExamens(this.pageExamsIndex());
  }

  loadExamens(p = 0) {
    this.loadingExams.set(true);

    this.examenLaboSvc
      .findByPatient(this.patient()!.id, p, this.pageSize)
      .pipe(takeUntil(this.destroyExams$))
      .subscribe({
        next: (page) => {
          this.successLoadExamens(page);
        },
        error: (e: ServiceError) => {
          this.loadingCons.set(false);
        },
      });
  }

  getExamenStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.LABORATOIRE);
  }

  getExamenStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.LABORATOIRE);
  }

  getExamenStatutIcon(s: string) {
    return this.commonService.getStatutIcon(s, Entite.LABORATOIRE);
  }

  getExamenStatutButtonSeverity(s: string): ButtonSeverity {
    return this.commonService.getStatutButtonSeverity(s, Entite.LABORATOIRE);
  }

  //------------------CONSULTATIONS---------------------------
  openConsultationDetails(cons: Consultation) {
    this.detailConsultation.set(cons);
    this.showDetailConsultation.set(true);
    // this.showDialogConsultation.set(true);
  }

  editableConsultation(cons: Consultation): boolean {
    if (!cons) return false;
    return cons.statut === StatutConsultation.PLANIFIEE;
  }

  confirmDeleteConsultation(consultation: Consultation) {
    this.confirmService.action(
      `Suppression de la consulation`,
      `Supprimer la consulation du ${consultation.patientPrenom} ${consultation.patientNom} ?`,
      () => {
        this.consultationSvc.delete(consultation.id).subscribe(() => {
          this.msgSvc.add({
            severity: 'success',
            summary: 'Supprimée',
            detail: 'consulation supprimée.',
          });
          this.loadConsultations(0);
        });
      },
    );
  }

  changeConsultationStatus(cons: Consultation, statut: StatutConsultation) {
    this.consultationSvc.updateStatus(cons.id, statut).subscribe({
      next: () => {
        this.consultations.update((list) =>
          list.map((r) => (r.id === cons.id ? { ...r, statut } : r)),
        );
        if (this.detailConsultation()?.id === cons.id)
          this.detailConsultation.set({ ...cons, statut });
        this.msgSvc.add({
          severity: 'success',
          summary: 'Statut mis à jour',
          detail: `Consultation marquée comme ${CONS_STATUT_CONFIG[statut].label}.`,
        });
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.loading.set(false);
        this.loadError.set(err.message);
      },
    });
  }

  onLazyLoadConsultations(e: any) {
    this.pageConsIndex.set(e.first / this.pageSize);
    this.loadConsultations(this.pageConsIndex());
  }

  retryLoadConsultations() {
    this.loadConsultations(this.pageConsIndex());
  }

  loadConsultations(p = 0) {
    this.loadingCons.set(true);

    this.consultationSvc
      .findAllByPatient(p, this.pageSize, this.patient()!.id)
      .pipe(takeUntil(this.destroyCons$))
      .subscribe({
        next: (page) => {
          this.successLoadConsultation(page);
        },
        error: (e: ServiceError) => {
          this.loadingCons.set(false);
        },
      });
  }

  successLoadConsultation(data: Page<Consultation>) {
    this.pageCons.set(data);
    this.consultations.set(data.content);
    this.loadingCons.set(false);
    this.buildTimeline();
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
  getConsultationStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.CONSULTATION);
  }

  getConsultationStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.CONSULTATION);
  }

  getConsultationStatutIcon(s: string) {
    return this.commonService.getStatutIcon(s, Entite.CONSULTATION);
  }

  getConsultationStatutButtonSeverity(s: string): ButtonSeverity {
    return this.commonService.getStatutButtonSeverity(s, Entite.CONSULTATION);
  }

  getInitiales(prenom: string, nom: string): string {
    return this.commonService.getInitiales(prenom, nom);
  }

  genererRapportPdf(examen: ExamenLabo) {
    this.examenLaboSvc.genererRapportPdf(examen);
  }
  genererOrdonnancePdf(ordonnance: Ordonnance) {
    this.ordonnanceSvc.genererPdf(ordonnance);
  }
  genererFacturePdf(facture: Facture) {
    this.factureSvc.genererPdf(facture);
  }
}
