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
import { ButtonModule, ButtonSeverity } from 'primeng/button';
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
import { Subject, takeUntil } from 'rxjs';
import { Page, ServiceError } from '../../../../../core/models/all/all.model';
import { Configuration } from '../../../../../core/models/configuration/configuration.model';
import { Entite } from '../../../../../core/models/enums/enums.model';
import {
  CONS_STATUT_CONFIG,
  Consultation,
  StatutConsultation,
} from '../../../../../core/models/patient/consultation.model';
import { Patient } from '../../../../../core/models/patient/patient.model';
import { CommonService } from '../../../../../core/services/common.services';
import { AppConfirmationService } from '../../../../../core/services/global/app.confirmation.service';
import { ConsultationService } from '../../../../../core/services/patient/consultation.service';

@Component({
  selector: 'clnt-patient-detail-consultation',
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
  ],
  providers: [AppConfirmationService],
  templateUrl: './patient-consultation.component.html',
  styleUrls: ['./patient-consultation.component.scss'],
})
export class PatientConsultationComponent implements OnInit {
  private commonService = inject(CommonService);

  private confirmService = inject(AppConfirmationService);
  private consultationSvc = inject(ConsultationService);
  private msgService = inject(MessageService);

  consultationsCount = output<number>();
  consultationsOut = output<Consultation[]>();

  index = input<number>(1);
  patient = input<Patient | null>(null);
  loadError = signal<string | null>(null);

  activeTab = signal(0);
  readonly pageSize = Configuration.pageSize;

  private destroy$ = new Subject<void>();
  loading = signal(true);
  page = signal<Page<Consultation> | null>(null);
  pageIndex = signal(0);
  consultations = signal<Consultation[]>([]);
  total = computed(() => this.page()?.page.totalElements ?? 0);
  // ── Dialog Consultation ────────────────────────────────────────
  showDetailConsultation = signal(false);

  // ── Dialog détail Consultation─────────────────────────────────────
  showDetail = signal(false);
  detail = signal<Consultation | null>(null);

  statutConsOptions = Object.entries(CONS_STATUT_CONFIG).map(([v, c]) => ({
    label: c.label,
    value: v,
  }));
  statutConsConfig = CONS_STATUT_CONFIG;

  selectedRdv = signal<Consultation | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  timeline = signal<any[]>([]);
  devise = this.commonService.deviseMonnetaire();

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDetails(cons: Consultation) {
    this.detail.set(cons);
    this.showDetail.set(true);
  }

  editable(cons: Consultation): boolean {
    if (!cons) return false;
    return cons.statut === StatutConsultation.PLANIFIEE;
  }

  confirmDelete(consultation: Consultation) {
    this.confirmService.action(
      `Suppression de la consulation`,
      `Supprimer la consulation du ${consultation.patientPrenom} ${consultation.patientNom} ?`,
      () => {
        this.consultationSvc.delete(consultation.id).subscribe(() => {
          this.msgService.add({
            severity: 'success',
            summary: 'Supprimée',
            detail: 'consulation supprimée.',
          });
          this.load(0);
        });
      },
    );
  }

  changeStatus(cons: Consultation, statut: StatutConsultation) {
    this.consultationSvc.updateStatus(cons.id, statut).subscribe({
      next: () => {
        this.consultations.update((list) =>
          list.map((r) => (r.id === cons.id ? { ...r, statut } : r)),
        );
        if (this.detail()?.id === cons.id) this.detail.set({ ...cons, statut });
        this.msgService.add({
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

  onLazyLoad(e: any) {
    this.pageIndex.set(e.first / this.pageSize);
    this.load(this.pageIndex());
  }

  retryLoad() {
    this.load(this.pageIndex());
  }

  load(p = 0) {
    this.loading.set(true);

    this.consultationSvc
      .findAllByPatient(p, this.pageSize, this.patient()!.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.successLoad(page);
        },
        error: (e: ServiceError) => {
          this.loading.set(false);
        },
      });
  }

  successLoad(data: Page<Consultation>) {
    this.page.set(data);
    this.consultations.set(data.content);
    this.loading.set(false);
    this.consultationsCount.emit(data.content.length);
    this.consultationsOut.emit(data.content);
  }

  formatDate(iso: string) {
    return this.commonService.formatDate(iso);
  }
  formatHeure(iso: string) {
    return this.commonService.formatHeure(iso);
  }

  getStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.CONSULTATION);
  }

  getStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.CONSULTATION);
  }

  getStatutIcon(s: string) {
    return this.commonService.getStatutIcon(s, Entite.CONSULTATION);
  }

  getStatutButtonSeverity(s: string): ButtonSeverity {
    return this.commonService.getStatutButtonSeverity(s, Entite.CONSULTATION);
  }

  getInitiales(prenom: string, nom: string): string {
    return this.commonService.getInitiales(prenom, nom);
  }
}
