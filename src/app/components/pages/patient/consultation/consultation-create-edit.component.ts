import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormsModule,
  FormGroup,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import { StepperModule } from 'primeng/stepper';
import { SelectLazyLoadEvent, SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import {
  MedecinLight,
  RendezVousLight,
  TYPES_CONSULTATION,
  CONS_DEPARTEMENTS,
  ConsultationRequest,
  Consultation,
  PatientLight,
} from '../../../../core/models/patient/consultation.model';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { ConsultationService } from '../../../../core/services/patient/consultation.service';
import { Patient } from '../../../../core/models/patient/patient.model';
import { EmployeService } from '../../../../core/services/employe/employe.service';
import { Configuration } from '../../../../core/models/configuration/configuration.model';
import { Employe } from '../../../../core/models/employe/employe.model';
import { RendezVous } from '../../../../core/models/agenda/agenda.model';
import { AgendaService } from '../../../../core/services/agenda/agenda.service';
import { Page, ServiceError } from '../../../../core/models/all/all.model';
import { CommonService } from '../../../../core/services/common.services';
import {
  Entite,
  StatutRendezVous,
} from '../../../../core/models/enums/enums.model';

// ── Mock data (remplacer par vrais services) ─────────────

@Component({
  selector: 'clnt-consultation-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    StepperModule,
    SelectModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    TagModule,
    AvatarModule,
    CardModule,
    MessageModule,
    SkeletonModule,
    ToastModule,
    DividerModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './consultation-create-edit.component.html',
  styleUrls: ['./consultation-create-edit.component.scss'],
})
export class ConsultationCreateEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private msg = inject(MessageService);
  private patientSvc = inject(PatientService);
  private employeSvc = inject(EmployeService);
  private agendaSvc = inject(AgendaService);
  private commonService = inject(CommonService);
  private service = inject(ConsultationService);
  private destroy$ = new Subject<void>();

  selectedItem: Employe | null = null;
  form!: FormGroup;
  consultationId: string = '';
  utilisateurId: string = '';

  // ── Étapes ────────────────────────────────────────────
  activeStep = signal(0);
  readonly STEPS = [
    { label: 'Médecin & Patient', icon: 'pi-users' },
    { label: 'Rendez-vous', icon: 'pi-calendar' },
    { label: 'Examen clinique', icon: 'pi-heart-rate-monitor' },
    { label: 'Diagnostic', icon: 'pi-clipboard' },
    { label: 'Récapitulatif', icon: 'pi-list-check' },
  ];

  departementOptions = [...CONS_DEPARTEMENTS];

  patient = signal<Patient | null>(null);
  loading = signal(true);
  editMode = signal(false);
  // ── Données ────────────────────────────────────────────
  patients = signal<PatientLight[]>([]);
  medecins = signal<Employe[]>([]);
  rdvDisponibles = signal<RendezVous[]>([]);
  loadingRdv = signal(false);
  loadingMeta = signal(true);
  loadError = signal<string | null>(null);
  globalError = signal<string | null>(null);
  saving = signal(false);
  filterDept = signal<string>('');

  // Signaux pour poids et taille
  poids = signal<number | null>(null);
  taille = signal<number | null>(null);

  // Sélections
  selectedPatient = signal<PatientLight | null>(null);
  selectedMedecin = signal<MedecinLight | null>(null);
  selectedRdv = signal<RendezVousLight | null>(null);
  selectedDpt = signal<string | null>(null);

  // Options pour les selects
  typesConsultation = TYPES_CONSULTATION;
  patientOptions = computed(() =>
    this.patients().map((p) => ({
      label: `${p.prenom} ${p.nom}`,
      value: p.id,
      data: p,
    })),
  );
  medecinOptions = computed(() =>
    this.medecins().map((m) => ({
      label: `${m.prenom} ${m.nom} — ${m.poste}`,
      value: m.id,
      data: m,
    })),
  );

  // ── IMC calculé ───────────────────────────────────────
  imc = computed(() => {
    const p = this.poids();
    const t = this.taille();

    if (!p || !t || t === 0) return null;
    const tM = t / 100;
    return (p / (tM * tM)).toFixed(1);
  });

  imcLabel = computed(() => {
    const v = parseFloat(this.imc() ?? '0');
    if (!v) return null;
    if (v < 18.5) return { label: 'Insuffisance pondérale', severity: 'warn' };
    if (v < 25) return { label: 'Poids normal', severity: 'success' };
    if (v < 30) return { label: 'Surpoids', severity: 'warn' };
    return { label: 'Obésité', severity: 'danger' };
  });

  ngOnInit() {
    this.initForm();

    // Mode modification si un ID est dans l'URL
    this.editionMode();

    // Réagir aux changements patient/médecin pour charger les RDV
    this.globalOnChanges();
    this.loadingMeta.set(false);
  }

  private initForm(): void {
    // ── Formulaire ────────────────────────────────────────
    this.form = this.fb.group({
      // Étape 1
      departement: ['', Validators.required],
      patientId: ['', Validators.required],
      medecinId: ['', Validators.required],
      // Étape 2
      rendezVousId: ['', Validators.required],
      // Étape 3 — Examen clinique
      type: ['GENERALE', Validators.required],
      tension: ['', [Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]],
      temperature: [
        null as number | null,
        [Validators.min(34), Validators.max(43)],
      ],
      poids: [null as number | null, [Validators.min(1), Validators.max(300)]],
      taille: [
        null as number | null,
        [Validators.min(30), Validators.max(250)],
      ],
      symptomes: [''],
      // Étape 4 — Diagnostic
      motif: ['', [Validators.required, Validators.minLength(3)]],
      diagnostic: [''],
      traitement: [''],
      notes: [''],
      dureeMinutes: [30, [Validators.min(5)]],
    });
  }

  private remplirFormulaire(c: Consultation): void {
    this.form = this.fb.group({
      // Étape 1
      departement: [c.departement || '', Validators.required],
      patientId: [c.patientId || '', Validators.required],
      medecinId: [c.medecinId || '', Validators.required],
      // Étape 2
      rendezVousId: [c.rendezVousId || '', Validators.required],
      // Étape 3 — Examen clinique
      type: [c.type || 'GENERALE', Validators.required],
      tension: [c.tension || '', [Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]],
      temperature: [
        c.temperature || (null as number | null),
        [Validators.min(34), Validators.max(43)],
      ],
      poids: [
        c.poids || (null as number | null),
        [Validators.min(1), Validators.max(300)],
      ],
      taille: [
        c.taille || (null as number | null),
        [Validators.min(30), Validators.max(250)],
      ],
      symptomes: [c.symptomes || ''],
      // Étape 4 — Diagnostic
      motif: [c.motif || '', [Validators.required, Validators.minLength(3)]],
      diagnostic: [c.diagnostic || ''],
      traitement: [c.traitement || ''],
      notes: [c.notes || ''],
      dureeMinutes: [c.dureeMinutes || 30, [Validators.min(5)]],
    });
    this.poids.set(c.poids ?? null);
    this.taille.set(c.taille ?? null);
    this.onSetEditModeValue(c);
    this.globalOnChanges();
  }

  private loadConsultation(id: string): void {
    this.loading.set(true);
    this.service.findById(id).subscribe({
      next: (c) => {
        this.remplirFormulaire(c);
        this.recuperationPatient(c.patientId);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        //this.errorMessage = 'Patient introuvable.';
      },
    });
  }

  editionMode() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      console.log(id);
      if (id) {
        this.editMode.set(true);
        this.consultationId = id;
        this.loadConsultation(id);
      } else {
        this.recuperationPatient();
      }
    });
  }

  globalOnChanges() {
    this.onChangesPatient();
    this.onChangesMedecin();
    this.onChangesPoids();
    this.onChangesTaille();
  }
  onChangesTaille() {
    this.form
      .get('taille')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((v) => this.taille.set(v));
  }

  onChangesPoids() {
    this.form
      .get('poids')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((v) => this.poids.set(v));
  }

  onChangesMedecin() {
    this.form
      .get('medecinId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.selectedMedecin.set(
          this.medecins().find((m) => m.id === id) ?? null,
        );
        if (this.selectedMedecin()) {
          this.utilisateurId = this.selectedMedecin()!.utilisateurId;
        }
        this.form.patchValue({ rendezVousId: '' });
        this.selectedRdv.set(null);
        this.chargerRdv();
      });
  }

  onChangesPatient() {
    this.form
      .get('patientId')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.selectedPatient.set(
          this.patients().find((p) => p.id === id) ?? null,
        );
        this.form.patchValue({ rendezVousId: '' });
        this.selectedRdv.set(null);
        this.chargerRdv();
      });
  }

  // ── Chargement RDV filtrés ────────────────────────────
  chargerRdv() {
    const pid = this.form.get('patientId')?.value;
    const mid =
      this.editMode() && !this.utilisateurId
        ? this.form.get('medecinId')?.value
        : this.utilisateurId;
    if (!pid || !mid) {
      this.rdvDisponibles.set([]);
      return;
    }

    this.loadingRdv.set(true);
    this.loadError.set(null);

    this.agendaSvc
      .findAgendaByDoctorAndPatient(
        this.commonService.getCurrentYear(),
        this.commonService.getCurrentMonth(),
        mid,
        pid,
      )
      .subscribe({
        next: (rendezVous) => {
          /* if (this.editMode()) {
            this.rdvDisponibles.set(rendezVous);
          } else {
            const patient = this.patients().find((p) => p.id === pid);
            const medecin = this.medecins().find((m) => m.id === mid);
            const filtered = rendezVous.filter(
              (r) =>
                r.patientId === patient?.id &&
                r.medecinNom.toLowerCase() ===
                  `${medecin?.nom.toLowerCase()} ${medecin?.prenom.toLowerCase()}`,
            );

            this.rdvDisponibles.set(filtered);
          } */
          this.rdvDisponibles.set(rendezVous);
          // Vérifier si le RDV courant est encore valide après chargement
          if (this.selectedRdv()) {
            const rdvCourant = rendezVous.find(
              (r) => r.id === this.selectedRdv()!.id,
            );
            if (!rdvCourant || this.isIndisponible(rdvCourant)) {
              this.selectedRdv.set(null);
              this.form.patchValue({ rendezVousId: '' });
              if (this.editMode()) {
                this.msg.add({
                  severity: 'warn',
                  summary: 'Rendez-vous indisponible',
                  detail:
                    "Le rendez-vous lié n'est plus disponible. Veuillez en sélectionner un nouveau.",
                  life: 5000,
                });
              }
            }
          }
          this.loadingRdv.set(false);

          this.loading.set(false);
        },
        error: (err: ServiceError) => {
          this.loading.set(false);
          this.loadError.set(err.message);
        },
      });
  }

  // ── Navigation étapes ─────────────────────────────────
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
    // Ne permet d'aller qu'aux étapes déjà validées
    if (index < this.activeStep()) {
      this.activeStep.set(index);
    }
  }

  etapeValide(step: number): boolean {
    switch (step) {
      case 0:
        return ['patientId', 'medecinId'].every((f) => this.form.get(f)?.valid);
      case 1:
        return !!this.selectedRdv();
      case 2:
        return (
          ['type'].every((f) => this.form.get(f)?.valid) &&
          !this.form.get('tension')?.errors &&
          !this.form.get('temperature')?.errors &&
          !this.form.get('poids')?.errors &&
          !this.form.get('taille')?.errors
        );
      case 3:
        return this.form.get('motif')?.valid ?? false;
      default:
        return true;
    }
  }

  etapeComplete(step: number): boolean {
    return this.activeStep() > step;
  }

  marquerEtapeTouchee(step: number) {
    const champs: Record<number, string[]> = {
      0: ['patientId', 'medecinId'],
      1: ['rendezVousId'],
      2: ['type', 'tension', 'temperature', 'poids', 'taille'],
      3: ['motif', 'diagnostic'],
    };
    (champs[step] ?? []).forEach((f) => this.form.get(f)?.markAsTouched());
  }

  // ── Sélection RDV ─────────────────────────────────────
  selectionnerRdv(rdv: RendezVousLight) {
    this.selectedRdv.set(rdv);
    this.form.patchValue({ rendezVousId: rdv.id });
    // Préremplir motif si vide
    if (!this.form.get('motif')?.value) {
      this.form.patchValue({ motif: rdv.motif });
    }
  }

  // ── Soumission ────────────────────────────────────────
  soumettre() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      // Trouver la première étape invalide
      for (let i = 0; i < 4; i++) {
        if (!this.etapeValide(i)) {
          this.activeStep.set(i);
          return;
        }
      }
      return;
    }

    const data = this.form.value as Partial<ConsultationRequest>;
    const op = this.editMode()
      ? this.service.edit(this.consultationId, data)
      : this.service.create(data);

    this.saving.set(true);
    this.globalError.set(null);

    op.subscribe({
      next: (consultation) => {
        this.saving.set(false);
        this.msg.add({
          severity: 'success',
          summary: this.editMode()
            ? 'Consultation modifiée'
            : 'Consultation créée',
          detail: `Consultation de ${this.selectedPatient()?.prenom} ${this.selectedPatient()?.nom} enregistrée.`,
        });
        setTimeout(
          () => this.router.navigate(['/patients', this.selectedPatient()!.id]),
          1500,
        );
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.globalError.set(err.message);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────
  getInitiales(prenom: string, nom: string) {
    return this.commonService.getInitiales(prenom, nom);
  }

  getRendezVousStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.AGENDA);
  }

  getRendezVousStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.AGENDA);
  }

  getRendezVousStatutIcon(s: string) {
    return this.commonService.getStatutIcon(s, Entite.AGENDA);
  }

  isIndisponible(rdv: RendezVous): boolean {
    const dateAComparer: Date = new Date(rdv.dateHeure);
    const dateCourante: Date = new Date();
    const indispo = dateAComparer < dateCourante;

    return (
      rdv.statut === StatutRendezVous.ANNULE ||
      rdv.statut === StatutRendezVous.TERMINE ||
      rdv.statut === StatutRendezVous.A_REASSIGNER ||
      indispo
    );
  }
  disponible(rdv: RendezVous) {
    return !this.isIndisponible(rdv);
  }

  formatDate(iso: string) {
    return this.commonService.formatDateLocaleDateString(iso);
  }

  formatHeure(iso: string) {
    return this.commonService.formatHeure(iso);
  }

  hasError(name: string) {
    const c = this.form.get(name);
    return c && (c.dirty || c.touched) && c.invalid;
  }

  fieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Ce champ est obligatoire.';
    if (c.errors?.['minlength'])
      return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors?.['min']) return `Valeur minimale : ${c.errors['min'].min}.`;
    if (c.errors?.['max']) return `Valeur maximale : ${c.errors['max'].max}.`;
    if (c.errors?.['pattern']) return 'Format invalide (ex: 120/80).';
    return '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterDept(v: string) {
    const option = this.departementOptions.find((o) => o.value === v);
    this.filterDept.set(v);
    this.selectedDpt.set(option!.label);
    this.selectedMedecin.set(null);
    this.medecins.set([]);
    this.form.patchValue({ medecinId: '' });
    this.loadMedecins(0, true);
  }

  private recuperationPatient(id?: string): void {
    const patientId = id ?? this.route.snapshot.paramMap.get('patientId');

    if (!patientId) {
      this.handleMissingPatient();
      return;
    }
    this.patientSvc.findById(patientId).subscribe({
      next: (p) => {
        this.patient.set(p);
        this.loading.set(false);

        this.patients.update((items) => [...items, p]);
      },
      error: () => {
        this.loading.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Patient introuvable.',
        });
      },
    });
  }

  private handleMissingPatient(): void {
    this.loading.set(false);

    this.msg.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Patient introuvable.',
    });
    this.router.navigate(['/patients']);
  }

  onMedecinsLazyLoad(event: SelectLazyLoadEvent) {
    // Extract `event.first` (start index) and `event.rows` (chunk size)
    // to query your backend API.
    const startIndex = event.first ?? 0;
    this.loading.set(true);
    this.loadMedecins(startIndex, false);
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

          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.msg.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Aucun medecin trouvé.',
          });
        },
      });
  }

  onSetEditModeValue(c: Consultation) {
    const medecin: MedecinLight = {
      id: c.medecinId,
      utilisateurId: this.utilisateurId,
      nom: c.medecinNom,
      prenom: '',
      poste: '',
      departement: c.departement,
    };
    const patient: PatientLight = {
      id: c.patientId,
      nom: c.patientNom,
      prenom: c.patientPrenom,
      dateNaissance: '',
      age: c.age,
    };

    this.selectedMedecin.set(medecin);
    this.selectedPatient.set(patient);
    const option = this.departementOptions.find(
      (o) => o.value === c.departement,
    );
    this.filterDept.set(c.departement);
    this.selectedDpt.set(option!.label);
    this.loadMedecins(0, true);
    this.chargerRdv();
  }
  getPageTitle(): string {
    return !this.editMode()
      ? 'Nouvelle consultation'
      : 'Modifier la consultation';
  }

  getPageSubtitle(): string {
    return !this.editMode()
      ? 'Enregistrement à la réception'
      : 'Mise à jour de la consultation';
  }
}
