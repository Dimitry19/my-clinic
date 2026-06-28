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
  FormArray,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SelectLazyLoadEvent, SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import {
  ORDONNANCE_STEPS,
  Page,
  ServiceError,
} from '../../../core/models/all/all.model';
import { Configuration } from '../../../core/models/configuration/configuration.model';
import { Employe } from '../../../core/models/employe/employe.model';
import {
  MedicamentLigne,
  Ordonnance,
  OrdonnanceRequest,
} from '../../../core/models/ordonnance/ordonnance.model';
import {
  PatientLight,
  Consultation,
  MedecinLight,
  CONS_DEPARTEMENTS,
} from '../../../core/models/patient/consultation.model';
import { Patient } from '../../../core/models/patient/patient.model';
import { CommonService } from '../../../core/services/common.services';
import { EmployeService } from '../../../core/services/employe/employe.service';
import { OrdonnanceService } from '../../../core/services/ordonnance/ordonnance.service';
import { ConsultationService } from '../../../core/services/patient/consultation.service';
import { PatientService } from '../../../core/services/patient/patient.service';
import { Entite } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'clnt-ordonnance-create-edit',
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
    InputNumberModule,
    TagModule,
    MessageModule,
    SkeletonModule,
    ToastModule,
    TooltipModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './ordonnance-create-edit.component.html',
  styleUrls: ['./ordonnance-create-edit.component.scss'],
})
export class OrdonnanceCreateEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private msg = inject(MessageService);
  private svc = inject(OrdonnanceService);
  private patientSvc = inject(PatientService);
  private employeSvc = inject(EmployeService);
  private consultSvc = inject(ConsultationService);
  private commonSvc = inject(CommonService);
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  ordonnanceId = '';

  // ── Étapes ───────────────────────────────────────────────
  activeStep = signal(0);
  readonly STEPS = [...ORDONNANCE_STEPS];

  // ── État ─────────────────────────────────────────────────
  editMode = signal(false);
  loading = signal(false);
  loadingMeta = signal(false);
  loadingCons = signal(false);
  saving = signal(false);
  globalError = signal<string | null>(null);
  filterDept = signal<string>('');

  // ── Données ──────────────────────────────────────────────
  patient = signal<Patient | null>(null);
  patients = signal<PatientLight[]>([]);
  medecins = signal<Employe[]>([]);
  consultations = signal<Consultation[]>([]);
  selectedPatient = signal<PatientLight | null>(null);
  selectedMedecin = signal<MedecinLight | null>(null);
  selectedConsultation = signal<Consultation | null>(null);

  // ── Options ──────────────────────────────────────────────
  departementOptions = [...CONS_DEPARTEMENTS];

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

  // ── FormArray médicaments ─────────────────────────────────
  get medicamentsArray(): FormArray {
    return this.form.get('medicaments') as FormArray;
  }

  // ── Init ─────────────────────────────────────────────────
  ngOnInit() {
    this.initForm();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      const patientId = params.get('patientId');

      if (id) {
        this.editMode.set(true);
        this.ordonnanceId = id;
        this.loadOrdonnance(id);
      } else {
        if (patientId) this.loadPatient(patientId);
      }
    });

    // Réaction changement patient → charger consultations
    this.onChangePatient();

    // Réaction changement médecin
    this.onChangeMedecin();
  }

  onChangePatient() {
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
  }
  onChangeMedecin() {
    this.form
      .get('medecinId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.selectedMedecin.set(
          this.medecins().find((m) => m.id === id) ?? null,
        );
      });
  }

  private initForm(): void {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      medecinId: ['', Validators.required],
      departement: [''],
      consultationId: ['', Validators.required],
      dateEmission: [new Date().toISOString().slice(0, 16)],
      validiteJours: [30, [Validators.required, Validators.min(1)]],
      instructions: [''],
      medicaments: this.fb.array([this.buildMedicamentGroup()]),
    });
  }

  private buildMedicamentGroup(m?: Partial<MedicamentLigne>): FormGroup {
    return this.fb.group({
      medicamentNom: [m?.medicamentNom ?? '', Validators.required],
      dosage: [m?.dosage ?? ''],
      frequence: [m?.frequence ?? ''],
      duree: [m?.duree ?? ''],
      instructions: [m?.instructions ?? ''],
    });
  }

  // ── Chargement en mode édition ────────────────────────────
  private loadOrdonnance(id: string): void {
    this.loading.set(true);
    this.svc.findById(id).subscribe({
      next: (o) => {
        // Reconstruire le FormArray avec les médicaments existants
        const medArray = this.fb.array(
          o.medicaments.map((m) => this.buildMedicamentGroup(m)),
        );
        this.form = this.fb.group({
          patientId: [o.patientId, Validators.required],
          medecinId: [o.medecinId, Validators.required],
          departement: [''],
          consultationId: [o.consultationId, Validators.required],
          dateEmission: [o.dateEmission?.slice(0, 16)],
          validiteJours: [
            o.validiteJours,
            [Validators.required, Validators.min(1)],
          ],
          instructions: [o.instructions ?? ''],
          medicaments: medArray,
        });

        // Reconstruire les signaux pour l'affichage des cartes
        this.onSetEditModeValue(o);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Ordonnance introuvable.',
        });
        this.router.navigate(['/ordonnance']);
      },
    });
  }

  onSetEditModeValue(o: Ordonnance) {
    if (this.editMode()) {
      this.loadPatient(o.patientId);
      this.loadMedecin(o.medecinId);
    }
  }

  private loadMedecin(id: string): void {
    this.employeSvc.findByUtilisateurId(id).subscribe({
      next: (m) => {
        const light: MedecinLight = {
          id: m.id,
          utilisateurId: m.utilisateurId,
          prenom: m.prenom,
          nom: m.nom,
          poste: m.poste,
          departement: m.departement,
        };

        this.medecins.update((items) =>
          items.some((x) => x.id === m.id) ? items : [...items, m],
        );

        this.selectedMedecin.set(light);
        this.form.patchValue({ prescritParId: id });
      },
      error: () =>
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Medecin introuvable.',
        }),
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
        this.loadConsultations(p.id);
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
    this.consultSvc.findAllByPatient(0, 20, patientId).subscribe({
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

  // ── Médecins lazy load ────────────────────────────────────
  onMedecinsLazyLoad(event: SelectLazyLoadEvent): void {
    this.loadMedecins(event.first ?? 0, false);
  }

  onFilterDept(v: string): void {
    this.filterDept.set(v);
    this.selectedMedecin.set(null);
    this.medecins.set([]);
    this.form.patchValue({ medecinId: '' });
    this.loadMedecins(0, true);
  }

  private loadMedecins(startIndex: number, changedDept: boolean): void {
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

  // ── Sélection consultation ────────────────────────────────
  selectionnerConsultation(cons: Consultation): void {
    this.selectedConsultation.set(cons);
    this.form.patchValue({ consultationId: cons.id });
  }

  // ── Gestion FormArray médicaments ─────────────────────────
  ajouterMedicament(): void {
    this.medicamentsArray.push(this.buildMedicamentGroup());
  }

  supprimerMedicament(index: number): void {
    if (this.medicamentsArray.length > 1) {
      this.medicamentsArray.removeAt(index);
    }
  }

  // ── Navigation étapes ─────────────────────────────────────
  etapeSuivante(): void {
    if (!this.etapeValide(this.activeStep())) {
      this.marquerEtapeTouchee(this.activeStep());
      return;
    }
    if (this.activeStep() < this.STEPS.length - 1) {
      this.activeStep.update((s) => s + 1);
    }
  }

  etapePrecedente(): void {
    if (this.activeStep() > 0) this.activeStep.update((s) => s - 1);
  }

  allerEtape(index: number): void {
    if (index < this.activeStep()) this.activeStep.set(index);
  }

  etapeValide(step: number): boolean {
    switch (step) {
      case 0:
        return ['patientId', 'medecinId'].every((f) => this.form.get(f)?.valid);
      case 1:
        return !!this.selectedConsultation();
      case 2:
        return this.medicamentsArray.valid && this.medicamentsArray.length > 0;
      default:
        return true;
    }
  }

  etapeComplete(step: number): boolean {
    return this.activeStep() > step;
  }

  marquerEtapeTouchee(step: number): void {
    const champs: Record<number, string[]> = {
      0: ['patientId', 'medecinId'],
      1: ['consultationId'],
      2: [],
    };
    (champs[step] ?? []).forEach((f) => this.form.get(f)?.markAsTouched());
    if (step === 2)
      this.medicamentsArray.controls.forEach((c) => c.markAllAsTouched());
  }

  // ── Soumission ────────────────────────────────────────────
  soumettre(): void {
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

    const req: OrdonnanceRequest = {
      consultationId: this.form.value.consultationId,
      patientId: this.form.value.patientId,
      medecinId: this.form.value.medecinId,
      dateEmission: this.form.value.dateEmission,
      validiteJours: this.form.value.validiteJours,
      instructions: this.form.value.instructions || null,
      medicaments: this.form.value.medicaments as MedicamentLigne[],
    };

    const op$ = this.editMode()
      ? this.svc.edit(this.ordonnanceId, req)
      : this.svc.create(req);

    this.saving.set(true);
    this.globalError.set(null);

    op$.subscribe({
      next: (o) => {
        this.saving.set(false);
        this.msg.add({
          severity: 'success',
          summary: this.editMode() ? 'Ordonnance modifiée' : 'Ordonnance créée',
          detail: `Ordonnance de ${this.selectedPatient()?.prenom} ${this.selectedPatient()?.nom} enregistrée.`,
        });
        setTimeout(() => {
          if (this.patient()) {
            this.router.navigate(['/patients', this.patient()!.id]);
          } else {
            this.router.navigate(['/patients']);
          }
        }, 1500);
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.globalError.set(err.message);
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  getInitiales(prenom: string, nom: string): string {
    return this.commonSvc.getInitiales(prenom, nom);
  }

  formatDate(iso: string): string {
    return this.commonSvc.formatDateLocaleDateString(iso);
  }

  formatHeure(iso: string): string {
    return this.commonSvc.formatHeure(iso);
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && (c.dirty || c.touched) && c.invalid);
  }

  fieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Ce champ est obligatoire.';
    if (c.errors?.['min']) return `Valeur minimale : ${c.errors['min'].min}.`;
    return '';
  }

  medicamentHasError(index: number, name: string): boolean {
    const c = this.medicamentsArray.at(index).get(name);
    return !!(c && (c.dirty || c.touched) && c.invalid);
  }

  getPageTitle(): string {
    return this.editMode() ? "Modifier l'ordonnance" : 'Nouvelle ordonnance';
  }

  getPageSubtitle(): string {
    return this.editMode()
      ? 'Mise à jour des médicaments et instructions'
      : 'Prescrivez des médicaments au patient';
  }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getConsultationStatutLabel(s: string): string {
    return this.commonSvc.getStatutLabel(s, Entite.CONSULTATION);
  }
}
