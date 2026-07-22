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
import { Consultation } from '../../../../core/models/patient/consultation.model';
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
import { PatientConsultationComponent } from './consultation/patient-consultation.component';
import { PatientExamenComponent } from './examen/patient-examen.component';
import { PatientOrdonnanceComponent } from './ordonnance/patient-ordonnance.component';

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
    PatientConsultationComponent,
    PatientExamenComponent,
    PatientOrdonnanceComponent,
  ],
  providers: [MessageService, AppConfirmationService],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientSvc = inject(PatientService);
  private commonService = inject(CommonService);

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
  examenLaboCount = signal(0);
  examens = signal<ExamenLabo[]>([]);

  // --Consultations
  consultationsCount = signal(0);
  consultations = signal<Consultation[]>([]);

  // Ordonnances
  ordonnances = signal<Ordonnance[]>([]);

  saving = signal(false);
  formError = signal<string | null>(null);

  timeline = signal<any[]>([]);
  devise = this.commonService.deviseMonnetaire();

  recuperationsParallesDesDonnees(page: number, id: string) {
    forkJoin({
      p: this.patientSvc.findById(id),
    }).subscribe({
      next: ({ p }) => {
        this.patient.set(p);
        this.loading.set(false);
      },
      error: (err: ServiceError) => {
        this.loading.set(false);

        this.loadError.set(err.message);
      },
    });
  }
  ngOnInit() {
    const patientId = this.route.snapshot.paramMap.get('id')!;
    this.recuperationsParallesDesDonnees(0, patientId);

    setTimeout(() => {
      this.buildTimeline();
    }, 2000);
  }

  ngOnDestroy() {}

  private buildTimeline() {
    console.log('Consultations:', this.consultations().length);
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

  getExamenStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.LABORATOIRE);
  }

  formatDate(iso: string) {
    return this.commonService.formatDate(iso);
  }
  formatHeure(iso: string) {
    return this.commonService.formatHeure(iso);
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

  deviseMonnetaire(): string {
    return this.commonService.deviseMonnetaire();
  }
}
