import { Configuration } from './../../../core/models/configuration/configuration.model';
import {
  Component,
  inject,
  input,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import {
  Entite,
  StatutExamenLabo,
} from '../../../core/models/enums/enums.model';
import {
  EXAMEN_STATUT_CONFIG,
  ExamenLabo,
  ExamenLaboRequest,
} from '../../../core/models/laboratoire/laboratoire.model';

import { AppConfirmationService } from '../../../core/services/global/app.confirmation.service';
import { ExamenLaboService } from '../../../core/services/laboratoire/laboratoire.service';
import { CommonService } from '../../../core/services/common.services';
import { EmployeService } from '../../../core/services/employe/employe.service';
import { PatientService } from '../../../core/services/patient/patient.service';
import { Employe } from '../../../core/models/employe/employe.model';
import { Patient } from '../../../core/models/patient/patient.model';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'clnt-examen-labo-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
    DialogModule,
    SelectModule,
    TextareaModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService],
  templateUrl: './examens-labo.component.html',
  styleUrls: ['./examens-labo.component.scss'],
})
export class ExamensLaboComponent implements OnInit {
  // Input depuis patient-detail
  patientId = input.required<string>();
  consultationId = input<string | null>(null);

  private svc = inject(ExamenLaboService);
  private msg = inject(MessageService);
  private commonService = inject(CommonService);
  private confirmSvc = inject(AppConfirmationService);
  private fb = inject(FormBuilder);
  private patientSvc = inject(PatientService);
  private employeSvc = inject(EmployeService);

  // ── État ────────────────────────────────────────────────
  examens = signal<ExamenLabo[]>([]);
  total = signal(0);
  loading = signal(true);
  saving = signal(false);
  dialogVisible = signal(false);
  editTarget = signal<ExamenLabo | null>(null);

  patients = signal<Patient[]>([]);
  medecins = signal<Employe[]>([]);
  loadingMeta = signal(false);

  readonly pageSize = Configuration.pageSize;
  page = 0;
  pagePatients = 0;
  pageMedecins = 0;

  statutOptions = Object.entries(EXAMEN_STATUT_CONFIG).map(([value, cfg]) => ({
    label: cfg.label,
    value,
  }));

  // ── Formulaire ──────────────────────────────────────────
  form = this.fb.group({
    patientId: ['', Validators.required],
    prescritPar: ['', Validators.required],
    typeExamen: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    statut: [StatutExamenLabo.EN_ATTENTE, Validators.required],
    datePrescription: [new Date().toISOString()],
    dateResultat: [null as string | null],
  });

  // ── Computed ────────────────────────────────────────────
  dialogTitle = computed(() =>
    this.editTarget() ? "Modifier l'examen" : 'Nouvel examen de laboratoire',
  );

  patientOptions = computed(() =>
    this.patients().map((p) => ({
      label: `${p.prenom} ${p.nom}`,
      value: p.id,
    })),
  );

  medecinOptions = computed(() =>
    this.medecins().map((m) => ({
      label: `${m.prenom} ${m.nom} — ${m.poste}`,
      value: m.id,
    })),
  );

  ngOnInit() {
    // this.loadExamens();
    this.loadMeta();
  }

  loadExamens() {
    this.loading.set(true);
    this.svc.findAll(this.page, this.pageSize).subscribe({
      next: (p) => {
        this.examens.set(p.content);
        this.total.set(p.page.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les examens.',
        });
      },
    });
  }

  private loadMeta(): void {
    this.loadingMeta.set(true);
    forkJoin({
      patients: this.patientSvc.findAll(this.pagePatients, this.pageSize),
      medecins: this.employeSvc.findAll(this.pageMedecins, this.pageSize),
    }).subscribe({
      next: ({ patients, medecins }) => {
        this.patients.set(patients.content);
        this.medecins.set(medecins.content);
        this.loadingMeta.set(false);
      },
      error: () => {
        this.loadingMeta.set(false);
        this.msg.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Impossible de charger les médecins et patients.',
        });
      },
    });
  }

  onLazyLoad(event: any) {
    this.page = event.first / this.pageSize;
    this.loadExamens();
  }

  // ── Dialog ──────────────────────────────────────────────
  openCreate() {
    this.editTarget.set(null);
    this.form.reset({
      statut: StatutExamenLabo.EN_ATTENTE,
      datePrescription: new Date().toISOString(),
    });
    this.dialogVisible.set(true);
  }

  openEdit(examen: ExamenLabo) {
    this.editTarget.set(examen);
    this.form.patchValue({
      patientId: examen.patientId,
      prescritPar: examen.prescritParId,
      typeExamen: examen.typeExamen,
      description: examen.description,
      statut: examen.statut,
      datePrescription: examen.datePrescription,
      dateResultat: examen.dateResultat,
    });
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.editTarget.set(null);
    this.form.reset();
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);

    const req: ExamenLaboRequest = {
      consultationId: this.consultationId() ?? '',
      patientId: this.form.value.patientId!,
      prescritPar: this.form.value.prescritPar!,
      typeExamen: this.form.value.typeExamen!,
      description: this.form.value.description ?? '',
      statut: this.form.value.statut as StatutExamenLabo,
      datePrescription: this.form.value.datePrescription ?? undefined,
      dateResultat: this.form.value.dateResultat,
    };

    const op$ = this.editTarget()
      ? this.svc.edit(this.editTarget()!.id, req)
      : this.svc.create(req);

    op$.subscribe({
      next: () => {
        this.saving.set(false);
        this.msg.add({
          severity: 'success',
          summary: this.editTarget() ? 'Examen modifié' : 'Examen créé',
          detail: `L'examen "${req.typeExamen}" a été enregistré.`,
        });
        this.closeDialog();
        this.loadExamens();
      },
      error: () => {
        this.saving.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue.',
        });
      },
    });
  }

  confirmDelete(examen: ExamenLabo) {
    this.confirmSvc.action(
      'Supprimer un examen',
      `Supprimer l'examen "${examen.typeExamen}" ?`,
      () =>
        this.svc.delete(examen.id).subscribe({
          next: () => {
            this.msg.add({
              severity: 'success',
              summary: 'Supprimé',
              detail: 'Examen supprimé.',
            });
            this.loadExamens();
          },
          error: () =>
            this.msg.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Suppression impossible.',
            }),
        }),
    );
  }

  formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && (c.dirty || c.touched) && c.invalid);
  }

  fieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Ce champ est obligatoire.';
    if (c.errors?.['maxlength'])
      return `Maximum ${c.errors['maxlength'].requiredLength} caractères.`;
    return '';
  }

  getStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.LABORATOIRE);
  }

  getStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.LABORATOIRE);
  }
  getStatutIcon(s: string): string {
    return this.commonService.getStatutIcon(s, Entite.LABORATOIRE);
  }
}
