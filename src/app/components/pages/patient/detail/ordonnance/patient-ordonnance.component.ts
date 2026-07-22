import { Page } from '../../../../../core/models/all/all.model';
import {
  Component,
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
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { TooltipModule } from 'primeng/tooltip';

import { Subject, takeUntil } from 'rxjs';
import { ServiceError } from '../../../../../core/models/all/all.model';
import { Patient } from '../../../../../core/models/patient/patient.model';
import { CommonService } from '../../../../../core/services/common.services';
import { AppConfirmationService } from '../../../../../core/services/global/app.confirmation.service';
import { Ordonnance } from '../../../../../core/models/ordonnance/ordonnance.model';
import { OrdonnanceService } from '../../../../../core/services/ordonnance/ordonnance.service';

@Component({
  selector: 'clnt-patient-detail-ordonnance',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TabsModule,
    ButtonModule,
    TagModule,
    CardModule,
    SkeletonModule,
    AvatarModule,
    DividerModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [AppConfirmationService],
  templateUrl: './patient-ordonnance.component.html',
  styleUrls: ['./patient-ordonnance.component.scss'],
})
export class PatientOrdonnanceComponent implements OnInit {
  private commonService = inject(CommonService);

  private ordonnanceSvc = inject(OrdonnanceService);
  private msgService = inject(MessageService);
  private confirmService = inject(AppConfirmationService);
  private destroy$ = new Subject<void>();

  ordonnancesOut = output<Ordonnance[]>();

  index = input<number>(3);
  patient = input<Patient | null>(null);
  loadError = signal<string | null>(null);
  loading = signal(true);

  ordonnances = signal<Ordonnance[]>([]);
  page = signal<Page<Ordonnance> | null>(null);
  pageIndex = signal(0);

  saving = signal(false);

  ngOnInit() {
    this.load();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(p = 0) {
    this.loading.set(true);

    this.ordonnanceSvc
      .findByPatient(this.patient()!.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.successLoad(data);
        },
        error: (e: ServiceError) => {
          this.loading.set(false);
        },
      });
  }

  successLoad(data: Ordonnance[]) {
    this.ordonnances.update((current) => [...current, ...data]);
    this.loading.set(false);
    this.ordonnancesOut.emit(data);
  }

  confirmDelete(o: Ordonnance) {
    this.confirmService.action(
      `Suppression de l'ordonnance`,
      `Supprimer de l'ordonnance donc la date d'emission est ${this.commonService.formatDate(o.dateEmission)} du patient ${o.patientNom} ?`,
      () => {
        this.ordonnanceSvc.delete(o.id).subscribe({
          next: () => {
            this.ordonnances.update((list) =>
              list.filter((r) => r.id !== o.id),
            );
            this.msgService.add({
              severity: 'success',
              summary: 'Supprimé',
              detail: 'Ordonnance supprimée.',
            });
            this.load();
          },
          error: (err: ServiceError) => {
            this.msgService.add({
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

  genererOrdonnancePdf(ordonnance: Ordonnance) {
    this.ordonnanceSvc.genererPdf(ordonnance);
  }
}
