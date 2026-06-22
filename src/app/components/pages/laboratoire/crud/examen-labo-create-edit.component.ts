import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormsModule,
  FormGroup,
} from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SelectLazyLoadEvent, SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PatientService } from '../../../../core/services/patient/patient.service';
import { EmployeService } from '../../../../core/services/employe/employe.service';
import { Patient } from '../../../../core/models/patient/patient.model';
import { Employe } from '../../../../core/models/employe/employe.model';
import {
  MedecinLight,
  PatientLight,
  CONS_DEPARTEMENTS,
  Consultation,
} from '../../../../core/models/patient/consultation.model';
import { Configuration } from '../../../../core/models/configuration/configuration.model';
import { CommonService } from '../../../../core/services/common.services';
import { ServiceError, Page } from '../../../../core/models/all/all.model';
import {
  Entite,
  StatutExamenLabo,
} from '../../../../core/models/enums/enums.model';
import {
  EXAMEN_STATUT_CONFIG,
  ExamenLabo,
  ExamenLaboRequest,
} from '../../../../core/models/laboratoire/laboratoire.model';
import { ExamenLaboService } from '../../../../core/services/laboratoire/laboratoire.service';
import { ConsultationService } from '../../../../core/services/patient/consultation.service';
import { environment } from '../../../../../environments/environment.prod';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'clnt-examen-labo-create-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    MessageModule,
    SkeletonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './examen-labo-create-edit.component.html',
  styleUrls: ['./examen-labo-create-edit.component.scss'],
})
export class ExamenLaboCreateEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private msg = inject(MessageService);
  private svc = inject(ExamenLaboService);
  private patientSvc = inject(PatientService);
  private employeSvc = inject(EmployeService);
  private commonSvc = inject(CommonService);
  private consultationSvc = inject(ConsultationService);
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  examenId = '';

  // ── Étapes ───────────────────────────────────────────────
  activeStep = signal(0);
  readonly STEPS = [
    { label: 'Médecin & Patient', icon: 'pi-users' },
    { label: 'Consultation', icon: 'pi-stethoscope' },
    { label: 'Détails examen', icon: 'pi-flask' },
    { label: 'Récapitulatif', icon: 'pi-list-check' },
  ];

  // ── État ─────────────────────────────────────────────────
  editMode = signal(false);
  loading = signal(true);
  loadingMeta = signal(false);
  saving = signal(false);
  globalError = signal<string | null>(null);
  filterDept = signal<string>('');

  // ── Données ──────────────────────────────────────────────
  patient = signal<Patient | null>(null);
  patients = signal<PatientLight[]>([]);
  medecins = signal<Employe[]>([]);
  selectedPatient = signal<PatientLight | null>(null);
  selectedMedecin = signal<MedecinLight | null>(null);
  consultations = signal<Consultation[]>([]);
  loadingCons = signal(false);
  selectedConsultation = signal<Consultation | null>(null);

  // ── Options ──────────────────────────────────────────────
  departementOptions = [...CONS_DEPARTEMENTS];

  readonly pageSize = Configuration.pageSize;
  page = 0;
  pagePatients = 0;

  statutOptions = Object.entries(EXAMEN_STATUT_CONFIG).map(([value, cfg]) => ({
    label: cfg.label,
    value,
  }));

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

  // ── Init ─────────────────────────────────────────────────
  ngOnInit() {
    this.initForm();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      const patientId = params.get('patientId');

      if (id) {
        this.editMode.set(true);
        this.examenId = id;
        this.loadExamen(id);
      } else {
        this.loading.set(false);
        if (environment.fakePatientId === patientId) {
          this.loadMeta();
          return;
        }
        if (patientId && environment.fakePatientId != patientId) {
          this.loadPatient(patientId);
          return;
        }
      }
    });

    // Réaction changement patient
    this.form
      .get('patientId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.selectedPatient.set(
          this.patients().find((p) => p.id === id) ?? null,
        );
        this.selectedConsultation.set(null);
        this.form.patchValue({ consultationId: '' });
        this.consultations.set([]);
        if (id) this.loadConsultations(id);
      });

    // Réaction changement médecin
    this.form
      .get('prescritPar')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.selectedMedecin.set(
          this.medecins().find((m) => m.id === id) ?? null,
        );
      });
  }

  private initForm(): void {
    const now = new Date().toISOString().slice(0, 16);
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      prescritPar: ['', Validators.required],
      departement: [''],
      consultationId: ['', Validators.required],
      typeExamen: ['', [Validators.required, Validators.maxLength(150)]],
      description: [''],
      statut: [StatutExamenLabo.EN_ATTENTE, Validators.required],
      datePrescription: [now],
      dateResultat: [null as string | null],
    });
  }

  private loadMeta(): void {
    this.loadingMeta.set(true);
    forkJoin({
      patients: this.patientSvc.findAll(this.pagePatients, this.pageSize),
    }).subscribe({
      next: ({ patients }) => {
        this.patients.set(patients.content);

        this.loadingMeta.set(false);
      },
      error: () => {
        this.loadingMeta.set(false);
        this.msg.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Impossible de charger les  patients.',
        });
      },
    });
  }

  private loadExamen(id: string): void {
    this.loading.set(true);
    this.svc.findById(id).subscribe({
      next: (e) => {
        this.form.patchValue({
          patientId: e.patientId,
          prescritPar: e.prescritParId,
          typeExamen: e.typeExamen,
          description: e.description,
          statut: e.statut,
          datePrescription: e.datePrescription?.slice(0, 16),
          dateResultat: e.dateResultat?.slice(0, 16) ?? null,
        });

        // Reconstruire les objets light pour l'affichage
        const [prenom, ...restNom] = e.prescritParNom.split(' ');
        this.selectedMedecin.set({
          id: e.prescritParId,
          utilisateurId: e.prescritParId,
          prenom,
          nom: restNom.join(' '),
          poste: '',
          departement: '',
        });

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Examen introuvable.',
        });
        this.router.navigate(['/examens-labo']);
      },
    });
  }

  private loadPatient(patientId: string): void {
    this.patientSvc.findById(patientId).subscribe({
      next: (p) => {
        this.patient.set(p);
        const light: PatientLight = {
          id: p.id,
          nom: p.nom,
          prenom: p.prenom,
          dateNaissance: p.dateNaissance,
          age: p.age,
        };
        this.patients.set([light]);
        this.selectedPatient.set(light);
        this.form.patchValue({ patientId: p.id });
      },
      error: () =>
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Patient introuvable.',
        }),
    });
  }

  private loadConsultations(patientId: string): void {
    this.loadingCons.set(true);
    this.consultationSvc.findAllByPatient(0, 20, patientId).subscribe({
      next: (page) => {
        this.consultations.set(page.content);
        this.loadingCons.set(false);
      },
      error: () => {
        this.loadingCons.set(false);
        this.msg.add({
          severity: 'warn',
          summary: 'Avertissement',
          detail: 'Impossible de charger les consultations.',
        });
      },
    });
  }

  selectionnerConsultation(cons: Consultation): void {
    this.selectedConsultation.set(cons);
    if (cons.medecinId != this.selectedMedecin()!.utilisateurId) {
      this.msg.add({
        severity: 'warn',
        summary: 'Avertissement',
        detail:
          "Le médécin de la consultation est different de celui qui prescrit l'examen.",
      });
    }
    this.form.patchValue({ consultationId: cons.id });
  }

  // ── Navigation étapes ────────────────────────────────────
  etapeSuivante() {
    if (!this.etapeValide(this.activeStep())) {
      this.marquerEtapeTouchee(this.activeStep());
      return;
    }
    if (this.activeStep() < this.STEPS.length - 1) {
      this.activeStep.update((s) => s + 1);
    }
  }

  etapePrecedente() {
    if (this.activeStep() > 0) this.activeStep.update((s) => s - 1);
  }

  allerEtape(index: number) {
    if (index < this.activeStep()) this.activeStep.set(index);
  }

  etapeValide(step: number): boolean {
    switch (step) {
      case 0:
        return ['patientId', 'prescritPar'].every(
          (f) => this.form.get(f)?.valid,
        );
      case 1:
        return !!this.selectedConsultation();
      case 2:
        return ['typeExamen', 'statut'].every((f) => this.form.get(f)?.valid);
      default:
        return true;
    }
  }

  etapeComplete(step: number): boolean {
    return this.activeStep() > step;
  }

  marquerEtapeTouchee(step: number) {
    const champs: Record<number, string[]> = {
      0: ['patientId', 'prescritPar'],
      1: ['consultationId'],
      2: ['typeExamen', 'statut'],
    };
    (champs[step] ?? []).forEach((f) => this.form.get(f)?.markAsTouched());
  }

  // ── Soumission ───────────────────────────────────────────
  soumettre() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      for (let i = 0; i < this.STEPS.length - 1; i++) {
        if (!this.etapeValide(i)) {
          this.activeStep.set(i);
          return;
        }
      }
      return;
    }

    const req: ExamenLaboRequest = {
      consultationId: this.form.value.consultationId,
      patientId: this.form.value.patientId,
      prescritPar: this.form.value.prescritPar,
      typeExamen: this.form.value.typeExamen,
      description: this.form.value.description ?? '',
      statut: this.form.value.statut,
      datePrescription: this.form.value.datePrescription,
      dateResultat: this.form.value.dateResultat || null,
    };

    const op$ = this.editMode()
      ? this.svc.edit(this.examenId, req)
      : this.svc.create(req);

    this.saving.set(true);
    this.globalError.set(null);

    op$.subscribe({
      next: () => {
        this.saving.set(false);
        this.msg.add({
          severity: 'success',
          summary: this.editMode() ? 'Examen modifié' : 'Examen créé',
          detail: `L'examen "${req.typeExamen}" a été enregistré.`,
        });
        setTimeout(() => {
          if (this.patient()) {
            this.router.navigate(['/patients', this.patient()!.id]);
          } else {
            this.router.navigate(['/examens-labo']);
          }
        }, 1500);
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.globalError.set(err.message);
      },
    });
  }

  onPatientsLazyLoad(event: SelectLazyLoadEvent) {
    this.loadPatients(event.first ?? 0);
  }

  private loadPatients(startIndex: number) {
    this.patientSvc.findAll(startIndex, Configuration.pageSize, '').subscribe({
      next: (data: Page<Patient>) => {
        this.patients.update((items) => {
          const updated = [...items];
          data.content.forEach((item, i) => {
            updated[startIndex + i] = item;
          });
          return updated;
        });
      },
      error: () =>
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Aucun patient trouvé.',
        }),
    });
  }

  // ── Chargement médecins ──────────────────────────────────
  onMedecinsLazyLoad(event: SelectLazyLoadEvent) {
    this.loadMedecins(event.first ?? 0, false);
  }

  onFilterDept(v: string) {
    this.filterDept.set(v);
    this.selectedMedecin.set(null);
    this.medecins.set([]);
    this.form.patchValue({ prescritPar: '' });
    this.loadMedecins(0, true);
  }

  private loadMedecins(startIndex: number, changedDept: boolean) {
    this.employeSvc
      .findEmployesByDepartementConsultation(
        startIndex,
        Configuration.pageSize,
        this.filterDept(),
      )
      .subscribe({
        next: (data: Page<Employe>) => {
          if (changedDept) {
            this.medecins.set(data.content);
          } else {
            this.medecins.update((items) => {
              const updated = [...items];
              data.content.forEach((item, i) => {
                updated[startIndex + i] = item;
              });
              return updated;
            });
          }
        },
        error: () =>
          this.msg.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Aucun médecin trouvé.',
          }),
      });
  }

  // ── Helpers ──────────────────────────────────────────────
  getStatutLabel(s: string): string {
    return this.commonSvc.getStatutLabel(s, Entite.LABORATOIRE);
  }

  getStatutSeverity(s: string) {
    console.log(s);
    return this.commonSvc.getStatutSeverity(s, Entite.LABORATOIRE);
  }
  getConsultationStatutLabel(s: string): string {
    return this.commonSvc.getStatutLabel(s, Entite.CONSULTATION);
  }

  getConsultationStatutSeverity(s: string) {
    console.log(s);
    return this.commonSvc.getStatutSeverity(s, Entite.CONSULTATION);
  }

  getInitiales(prenom: string, nom: string): string {
    return this.commonSvc.getInitiales(prenom, nom);
  }

  formatDate(iso: string): string {
    return this.commonSvc.formatDateLocaleDateString(iso);
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

  getPageTitle(): string {
    return this.editMode()
      ? "Modifier l'examen"
      : 'Nouvel examen de laboratoire';
  }

  getPageSubtitle(): string {
    return this.editMode()
      ? "Mise à jour des informations de l'examen"
      : 'Prescrivez un nouvel examen de laboratoire';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
