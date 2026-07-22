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
import { Patient } from '../../../../../core/models/patient/patient.model';
import { CommonService } from '../../../../../core/services/common.services';
import { AppConfirmationService } from '../../../../../core/services/global/app.confirmation.service';

import { ExamenLabo } from '../../../../../core/models/laboratoire/laboratoire.model';
import { ExamenLaboService } from '../../../../../core/services/laboratoire/laboratoire.service';

@Component({
  selector: 'clnt-patient-detail-examen',
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
  templateUrl: './patient-examen.component.html',
  styleUrls: ['./patient-examen.component.scss'],
})
export class PatientExamenComponent implements OnInit {
  private commonService = inject(CommonService);

  private examenLaboSvc = inject(ExamenLaboService);

  examenLaboCount = output<number>();
  examensOut = output<ExamenLabo[]>();

  index = input<number>(2);
  patient = input<Patient | null>(null);
  loadError = signal<string | null>(null);
  loading = signal(true);

  activeTab = signal(0);

  readonly pageSize = Configuration.pageSize;

  private destroy$ = new Subject<void>();

  page = signal<Page<ExamenLabo> | null>(null);
  pageIndex = signal(0);
  examens = signal<ExamenLabo[]>([]);
  total = computed(() => this.page()?.page.totalElements ?? 0);

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  successLoad(data: Page<ExamenLabo>) {
    this.page.set(data);
    this.examens.set(data.content);
    this.loading.set(false);
    this.examenLaboCount.emit(data.content.length);
    this.examensOut.emit(data.content);
  }

  onLazyLoad(e: any) {
    this.pageIndex.set(e.first / this.pageSize);
    this.load(this.pageIndex());
  }

  load(p = 0) {
    this.loading.set(true);

    this.examenLaboSvc
      .findByPatient(this.patient()!.id, p, this.pageSize)
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

  getStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.LABORATOIRE);
  }

  getStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.LABORATOIRE);
  }

  getStatutIcon(s: string) {
    return this.commonService.getStatutIcon(s, Entite.LABORATOIRE);
  }

  getStatutButtonSeverity(s: string): ButtonSeverity {
    return this.commonService.getStatutButtonSeverity(s, Entite.LABORATOIRE);
  }

  formatDate(iso: string) {
    return this.commonService.formatDate(iso);
  }
  formatHeure(iso: string) {
    return this.commonService.formatHeure(iso);
  }

  getInitiales(prenom: string, nom: string): string {
    return this.commonService.getInitiales(prenom, nom);
  }

  genererRapportPdf(examen: ExamenLabo) {
    this.examenLaboSvc.genererRapportPdf(examen);
  }
}
