import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  Signal,
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

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { FACT_STEPS, ServiceError } from '../../../core/models/all/all.model';
import {
  LigneRequest,
  FactureRequest,
} from '../../../core/models/facture/facture.model';
import {
  PatientLight,
  Consultation,
} from '../../../core/models/patient/consultation.model';
import { Patient } from '../../../core/models/patient/patient.model';
import { CommonService } from '../../../core/services/common.services';
import { FactureService } from '../../../core/services/facture/facture.service';
import { ConsultationService } from '../../../core/services/patient/consultation.service';
import { PatientService } from '../../../core/services/patient/patient.service';
import { Entite } from '../../../core/models/enums/enums.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'clnt-facture-create-edit',
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
  ],
  providers: [MessageService],
  templateUrl: './facture-create-edit.component.html',
  styleUrls: ['./facture-create-edit.component.scss'],
})
export class FactureCreateEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private msg = inject(MessageService);
  private svc = inject(FactureService);
  private patientSvc = inject(PatientService);
  private consultSvc = inject(ConsultationService);
  private commonSvc = inject(CommonService);
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  factureId = '';

  // ── Étapes ───────────────────────────────────────────────
  activeStep = signal(0);
  readonly STEPS = [...FACT_STEPS];

  // ── État ─────────────────────────────────────────────────
  editMode = signal(false);
  loading = signal(false);
  loadingCons = signal(false);
  saving = signal(false);
  globalError = signal<string | null>(null);

  // ── Données ──────────────────────────────────────────────
  patient = signal<Patient | null>(null);
  patients = signal<PatientLight[]>([]);
  consultations = signal<Consultation[]>([]);
  selectedPatient = signal<PatientLight | null>(null);
  selectedConsultation = signal<Consultation | null>(null);

  // ── Options selects ───────────────────────────────────────
  patientOptions = computed(() =>
    this.patients().map((p) => ({
      label: `${p.prenom} ${p.nom}`,
      value: p.id,
    })),
  );

  // ── FormArray lignes ──────────────────────────────────────
  get lignesArray(): FormArray {
    return this.form.get('lignes') as FormArray;
  }

  // ── Totaux calculés ───────────────────────────────────────
  readonly montantTotal = signal(0);

  // ── Init ─────────────────────────────────────────────────
  ngOnInit() {
    this.initForm();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      const patientId = params.get('patientId');

      if (id) {
        this.editMode.set(true);
        this.factureId = id;
        this.loadFacture(id);
      } else {
        if (patientId) this.loadPatient(patientId);
      }
    });

    // Réaction changement patient
    this.onChangePatient();
  }

  private listenTotal(): void {
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTotal());

    this.updateTotal();
  }

  private updateTotal(): void {
    const total = this.lignesArray.controls.reduce((sum, ctrl) => {
      const qte = Number(ctrl.get('quantite')?.value) || 0;
      const pu = Number(ctrl.get('prixUnitaire')?.value) || 0;

      return sum + qte * pu;
    }, 0);

    this.montantTotal.set(total);
  }

  private onChangePatient() {
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

  private initForm(): void {
    this.form = this.fb.group({
      patientId: ['', Validators.required],
      consultationId: [''],
      dateEmission: [new Date().toISOString().slice(0, 16)],
      notes: [''],
      lignes: this.fb.array([this.buildLigneGroup()]),
    });

    this.listenTotal();
  }

  private buildLigneGroup(l?: Partial<LigneRequest>): FormGroup {
    return this.fb.group({
      description: [l?.description ?? '', Validators.required],
      quantite: [l?.quantite ?? 1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [
        l?.prixUnitaire ?? 0,
        [Validators.required, Validators.min(0.01)],
      ],
    });
  }

  // ── Chargement ───────────────────────────────────────────
  private loadFacture(id: string): void {
    this.loading.set(true);
    this.svc.findById(id).subscribe({
      next: (f) => {
        this.lignesArray.clear();
        f.lignes.forEach((l) => {
          this.lignesArray.push(this.buildLigneGroup(l));
        });
        this.form.patchValue({
          patientId: f.patientId,
          consultationId: f.consultationId,
          dateEmission: f.dateEmission?.slice(0, 16),
          notes: f.notes,
        });
        this.loadPatient(f.patientId);
        this.updateTotal();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Facture introuvable.',
        });
        this.router.navigate(['/factures']);
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
    this.consultSvc.findAllByPatient(0, 50, patientId).subscribe({
      next: (page) => {
        this.consultations.set(page.content);
        this.loadingCons.set(false);
      },
      error: () => this.loadingCons.set(false),
    });
  }

  // ── Sélection consultation ────────────────────────────────
  selectionnerConsultation(cons: Consultation): void {
    this.selectedConsultation.set(cons);
    this.form.patchValue({ consultationId: cons.id });
  }

  deselectionnerConsultation(): void {
    this.selectedConsultation.set(null);
    this.form.patchValue({ consultationId: '' });
  }

  // ── Gestion FormArray lignes ──────────────────────────────
  ajouterLigne(): void {
    this.lignesArray.push(this.buildLigneGroup());
    this.updateTotal();
  }

  supprimerLigne(index: number): void {
    if (this.lignesArray.length > 1) {
      this.lignesArray.removeAt(index);
      this.updateTotal();
    }
  }

  totalLigne(index: number): number {
    const ctrl = this.lignesArray.at(index);
    return (
      (ctrl.get('quantite')?.value ?? 0) *
      (ctrl.get('prixUnitaire')?.value ?? 0)
    );
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
        return this.form.get('patientId')?.valid ?? false;
      case 1:
        return true; // consultation optionnelle
      case 2:
        return this.lignesArray.valid && this.lignesArray.length > 0;
      default:
        return true;
    }
  }

  etapeComplete(step: number): boolean {
    return this.activeStep() > step;
  }

  marquerEtapeTouchee(step: number): void {
    const champs: Record<number, string[]> = {
      0: ['patientId'],
      1: [],
      2: [],
    };
    (champs[step] ?? []).forEach((f) => this.form.get(f)?.markAsTouched());
    if (step === 2)
      this.lignesArray.controls.forEach((c) => c.markAllAsTouched());
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

    const req: FactureRequest = {
      patientId: this.form.value.patientId,
      consultationId: this.form.value.consultationId || null,
      dateEmission: this.form.value.dateEmission,
      notes: this.form.value.notes || null,
      lignes: this.form.value.lignes as LigneRequest[],
    };

    const op$ = this.editMode()
      ? this.svc.edit(this.factureId, req)
      : this.svc.create(req);

    this.saving.set(true);
    this.globalError.set(null);

    op$.subscribe({
      next: (f) => {
        this.saving.set(false);
        this.msg.add({
          severity: 'success',
          summary: this.editMode() ? 'Facture modifiée' : 'Facture créée',
          detail: `Facture ${f.numeroFacture} enregistrée.`,
        });
        setTimeout(() => {
          if (this.patient()) {
            this.router.navigate(['/patients', this.patient()!.id]);
          } else {
            this.router.navigate(['/factures', f.id]);
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

  formatMontant(v: number): string {
    return `${v.toLocaleString('fr-FR')} FCFA`;
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

  ligneHasError(index: number, name: string): boolean {
    const c = this.lignesArray.at(index).get(name);
    return !!(c && (c.dirty || c.touched) && c.invalid);
  }

  getPageTitle(): string {
    return this.editMode() ? 'Modifier la facture' : 'Nouvelle facture';
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
