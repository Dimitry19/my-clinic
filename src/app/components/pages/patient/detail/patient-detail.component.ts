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

import { PatientService } from '../../../../core/services/patient/patient.service';

import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../../core/services/common.services';
import {
  ExamenLabo,
  Facture,
  Ordonnance,
  Patient,
} from '../../../../core/models/patient/patient.model';
import {
  StatutExamenLabo,
  StatutFacture,
} from '../../../../core/models/enums/enums.model';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { Page, ServiceError } from '../../../../core/models/all/all.model';
import { ConsultationService } from '../../../../core/services/patient/consultation.service';
import { Configuration } from '../../../../core/models/configuration/configuration.model';
import { Consultation } from '../../../../core/models/patient/consultation.model';

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
  ],
  providers: [MessageService],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientSvc = inject(PatientService);
  private consultationSvc = inject(ConsultationService);
  private commonService = inject(CommonService);
  private msgSvc = inject(MessageService);
  private router = inject(Router);

  patient = signal<Patient | null>(null);
  loadError = signal<string | null>(null);
  loading = signal(true);

  activeTab = signal(0);
  readonly pageSize = 2; //Configuration.pageSize;

  // --Consultations
  private destroyCons$ = new Subject<void>();
  loadingCons = signal(true);
  pageCons = signal<Page<Consultation> | null>(null);
  pageConsIndex = signal(0);
  consultations = signal<Consultation[]>([]);
  totalConsultations = computed(() => this.pageCons()?.totalElements ?? 0);

  examens = signal<ExamenLabo[]>([
    {
      id: '1',
      date: new Date('2026-05-21'),
      type: 'NFS + Goutte épaisse',
      statut: StatutExamenLabo.TERMINE,
      resultat: 'Positif Pf',
    },
    {
      id: '2',
      date: new Date('2026-04-11'),
      type: 'Échographie abdominale',
      statut: StatutExamenLabo.TERMINE,
      resultat: 'Normal',
    },
    {
      id: '3',
      date: new Date('2026-06-01'),
      type: 'Glycémie à jeun',
      statut: StatutExamenLabo.EN_ATTENTE,
    },
  ]);

  factures = signal<Facture[]>([
    {
      id: '1',
      date: new Date('2026-05-20'),
      montant: 4500,
      paye: 4500,
      statut: StatutFacture.PAYEE,
    },
    {
      id: '2',
      date: new Date('2026-04-10'),
      montant: 2800,
      paye: 1500,
      statut: StatutFacture.PARTIELLEMENT_PAYEE,
    },
    {
      id: '3',
      date: new Date('2026-06-01'),
      montant: 1200,
      paye: 0,
      statut: StatutFacture.IMPAYEE,
    },
  ]);

  ordonnances = signal<Ordonnance[]>([
    {
      id: '1',
      date: new Date('2026-05-20'),
      medecin: 'Dr. Martin',
      medicaments: [
        'Artéméther-Luméfantrine 80/480mg — 1cp matin et soir 3j',
        'Paracétamol 1g — 1cp toutes les 8h si fièvre',
      ],
    },
    {
      id: '2',
      date: new Date('2026-04-10'),
      medecin: 'Dr. Dupont',
      medicaments: [
        'Oméprazole 20mg — 1cp avant repas 14j',
        'Antiacide — 2cp après repas 7j',
      ],
    },
  ]);

  timeline = signal<any[]>([]);

  recuperationsParallesDesDonnees(page: number, id: string) {
    forkJoin({
      p: this.patientSvc.findById(id),
      cons: this.consultationSvc.findAllByPatient(page, this.pageSize, id),
      //cong: this.svc.getConges(id),
    }).subscribe({
      next: ({ p, cons }) => {
        this.patient.set(p);
        this.loading.set(false);
        this.successLoadConsultation(cons);
        //this.conges.set(cong);
      },
      error: (err: ServiceError) => {
        this.loading.set(false);
        this.loadingCons.set(false);
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
        date: e.date,
        icon: 'ti ti-flask',
        color: '#0F6E56',
        title: e.type,
        subtitle: e.resultat ?? 'En attente',
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
      .filter((f) => f.statut !== 'PAYEE')
      .reduce((acc, f) => acc + (f.montant - f.paye), 0);
  }

  getSexeLabel(s: string) {
    return s === 'M' ? 'Homme' : s === 'F' ? 'Femme' : 'Autre';
  }

  getFactureSeverity(s: string) {
    return (
      { PAYEE: 'success', PARTIELLEMENT_PAYEE: 'warn', IMPAYEE: 'danger' }[s] ??
      'secondary'
    );
  }

  getExamenSeverity(s: string) {
    return (
      { TERMINE: 'success', EN_COURS: 'info', EN_ATTENTE: 'warn' }[s] ??
      'secondary'
    );
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

  private recuperationPatient(): void {
    const patientId = this.route.snapshot.paramMap.get('id')!;
    if (!patientId) {
      this.handleMissingPatient();
    }
    this.patientSvc.findById(patientId).subscribe({
      next: (p) => {
        this.patient.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.msgSvc.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Patient introuvable.',
        });
      },
    });

    console.log(patientId);
  }

  private handleMissingPatient(): void {
    this.loading.set(false);

    this.msgSvc.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Patient introuvable.',
    });
    this.router.navigate(['/patients']);
  }

  confirmDeleteConsultation(consultation: Consultation) {
    /* this.confirmService.confirm({
      message: `Supprimer la consulation du ${patient.prenom} ${patient.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.service.delete(patient.id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Supprimé',
            detail: 'Patient supprimé.',
          });
          this.pageConsIndex(0, this.searchQuery);
        });
      },
    });*/
  }

  onLazyLoadConsultations(e: any) {
    console.log('Lazy Event', e);
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

  successLoadConsultation(page: Page<Consultation>) {
    console.log('PAGE', page);
    this.pageCons.set(page);
    this.consultations.set(page.content);
    this.loadingCons.set(false);
    this.buildTimeline();
    console.log('TOTAL', this.totalConsultations());
  }
  formatDate(iso: string) {
    return this.commonService.formatDate(iso);
  }
  formatHeure(iso: string) {
    return this.commonService.formatHeure(iso);
  }

  getConsultationStatutSeverity(s: string) {
    return (
      {
        PLANIFIEE: 'warn',
        EN_COURS: 'info',
        TERMINEE: 'success',
        ANNULER: 'danger',
      }[s] ?? 'secondary'
    );
  }
}
