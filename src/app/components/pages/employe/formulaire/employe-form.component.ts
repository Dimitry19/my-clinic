import {
  Component,
  input,
  output,
  inject,
  OnInit,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { DividerModule } from 'primeng/divider';
import {
  Employe,
  DEPARTEMENTS,
  CONTRATS,
} from '../../../../core/models/employe/employe.model';
import {
  EmployeService,
  ServiceError,
} from '../../../../core/services/employe/employe.service';

@Component({
  selector: 'clnt-employe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    StepperModule,
    DividerModule,
  ],
  templateUrl: './employe-form.component.html',
  styleUrls: ['./employe-form.component.scss'],
})
export class EmployeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(EmployeService);
  today = new Date();

  // Inputs / Outputs
  employe = input<Employe | null>(null);
  editMode = input(false);
  saved = output<Employe>();
  errorOccured = output<ServiceError>();
  cancelled = output<void>();

  // State
  saving = signal(false);
  globalError = signal<string | null>(null);
  fieldErrors = signal<Record<string, string>>({});
  activeStep = signal(0);

  departements = DEPARTEMENTS;
  contrats = CONTRATS;

  statutOptions = [
    { label: 'Actif', value: 'ACTIF' },
    { label: 'Inactif', value: 'INACTIF' },
  ];

  form = this.fb.group({
    // Étape 1 — Identité
    nom: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    prenom: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.pattern(/^[0-9+\s\-()\d]{8,15}$/)]],

    // Étape 2 — Poste
    poste: ['', [Validators.required, Validators.minLength(2)]],
    departement: ['', Validators.required],
    typeContrat: ['', Validators.required],
    dateEmbauche: ['', [Validators.required, this.datePasseeOuAujourdhui]],
    salaireBase: [
      null as number | null,
      [Validators.required, Validators.min(0)],
    ],

    // Étape 3 — Administratif
    numeroCnss: [''],
    rib: [''],
    adresse: [''],
    statut: ['ACTIF'],
  });

  constructor() {
    // Remplir le formulaire quand l'employé input change
    effect(() => {
      const e = this.employe();
      if (e) {
        this.form.patchValue({
          nom: e.nom,
          prenom: e.prenom,
          email: e.email,
          telephone: e.telephone ?? '',
          poste: e.poste,
          departement: e.departement,
          typeContrat: e.typeContrat,
          dateEmbauche: e.dateEmbauche,
          salaireBase: e.salaireBase,
          numeroCnss: e.numeroCnss ?? '',
          rib: e.rib ?? '',
          adresse: e.adresse ?? '',
          statut: e.statut,
        });
      }
    });
  }

  ngOnInit() {}

  // ── Validators custom ─────────────────────────────────
  private datePasseeOuAujourdhui(c: AbstractControl): ValidationErrors | null {
    if (!c.value) return null;
    const d = new Date(c.value);
    return d <= new Date() ? null : { dateFuture: true };
  }

  // ── Getters erreurs ───────────────────────────────────
  fieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Ce champ est obligatoire.';
    if (c.errors?.['email']) return 'Format email invalide.';
    if (c.errors?.['minlength'])
      return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors?.['maxlength'])
      return `Maximum ${c.errors['maxlength'].requiredLength} caractères.`;
    if (c.errors?.['pattern']) return 'Format invalide.';
    if (c.errors?.['min']) return 'La valeur doit être positive.';
    if (c.errors?.['dateFuture'])
      return 'La date ne peut pas être dans le futur.';
    // Erreur serveur sur ce champ
    return this.fieldErrors()[name] ?? '';
  }

  hasError(name: string): boolean {
    const c = this.form.get(name);
    return !!(
      c &&
      (c.dirty || c.touched) &&
      (c.invalid || !!this.fieldErrors()[name])
    );
  }

  hasSuccess(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.valid && c.dirty && !this.fieldErrors()[name]);
  }

  // ── Validation étape ──────────────────────────────────
  etape1Valide(): boolean {
    return ['nom', 'prenom', 'email'].every((f) => this.form.get(f)?.valid);
  }

  etape2Valide(): boolean {
    return [
      'poste',
      'departement',
      'typeContrat',
      'dateEmbauche',
      'salaireBase',
    ].every((f) => this.form.get(f)?.valid);
  }

  allerEtape(n: number) {
    if (n === 1 && !this.etape1Valide()) {
      ['nom', 'prenom', 'email', 'telephone'].forEach((f) =>
        this.form.get(f)?.markAsTouched(),
      );
      return;
    }
    if (n === 2 && !this.etape2Valide()) {
      [
        'poste',
        'departement',
        'typeContrat',
        'dateEmbauche',
        'salaireBase',
      ].forEach((f) => this.form.get(f)?.markAsTouched());
      return;
    }
    this.activeStep.set(n);
  }

  // ── Soumission ────────────────────────────────────────
  soumettre() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      // Aller à la première étape avec des erreurs
      if (!this.etape1Valide()) {
        this.activeStep.set(0);
        return;
      }
      if (!this.etape2Valide()) {
        this.activeStep.set(1);
        return;
      }
      return;
    }

    this.saving.set(true);
    this.globalError.set(null);
    this.fieldErrors.set({});

    const data = this.form.value as Partial<Employe>;
    const op =
      this.editMode() && this.employe()
        ? this.svc.edit(this.employe()!.id, data)
        : this.svc.create(data);

    op.subscribe({
      next: (emp) => {
        this.saving.set(false);
        this.saved.emit(emp);
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        if (err.code === 'CONFLICT' && err.field) {
          // Erreur sur un champ spécifique — aller à l'étape correspondante
          this.fieldErrors.update((e) => ({ ...e, [err.field!]: err.message }));
          if (err.field === 'email') {
            this.activeStep.set(0);
          }
        } else {
          this.globalError.set(err.message);
        }
        this.errorOccured.emit(err);
      },
    });
  }

  annuler() {
    this.cancelled.emit();
  }
}
