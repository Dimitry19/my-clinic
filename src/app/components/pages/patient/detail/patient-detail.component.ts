import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import type { ButtonSeverity } from 'primeng/button';

import { PatientService } from '../../../../core/services/patient/patient.service';

import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../../core/services/common.services';
import { Patient } from '../../../../core/models/patient/patient.model';
import { Entite } from '../../../../core/models/enums/enums.model';
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
import { Facture } from '../../../../core/models/facture/facture.model';
import { FactureService } from '../../../../core/services/facture/facture.service';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PatientFactureComponent } from './facture/patient-facture.component';
import { PatientDetailCardComponent } from './card/patient-detail-card.component';
import { SummaryCardComponent } from './card/summary-card.component';

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
    PatientDetailCardComponent,
    SummaryCardComponent,
    PatientFactureComponent,
  ],
  providers: [MessageService, AppConfirmationService],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
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

  // Factures
  facturesCount = signal(0);
  soldeDu = signal(0);

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

  selectedRdv = signal<Consultation | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  timeline = signal<any[]>([]);
  devise = this.commonService.deviseMonnetaire();

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

  deviseMonnetaire(): string {
    return this.commonService.deviseMonnetaire();
  }
}
