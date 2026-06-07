import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Patient } from '../../../../core/models/all/all.model';
import { PatientService } from '../../../../core/services/patient/patient.service';

@Component({
  selector: 'clnt-employe-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employe-add-edit.component.html',
  styleUrls: ['./employe-add-edit.component.scss'],
})
export class EmployeAddEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  mode: 'creation' | 'modification' = 'creation';
  employeId?: string;
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  // Recherche employe existant
  searchQuery = '';

  searchLoading = false;
  showSearchResults = false;
  searchResults: Patient[] = [];
  private searchSubject = new Subject<string>();

  // Etapes du formulaire
  currentStep = 1;
  readonly totalSteps = 3;

  readonly groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  readonly mutuelles = ['CNSS', 'CNAM', 'Autre', 'Aucune'];

  private destroy$ = new Subject<void>();
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initSearch();

    // Mode modification si un ID est dans l'URL
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      console.log(id);
      if (id) {
        this.mode = 'modification';
        this.employeId = id;
        this.chargerPatient(id);
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      // Etape 1 — Identité
      nom: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      prenom: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      dateNaissance: ['', [Validators.required, this.datePasseeValidator]],
      sexe: ['', Validators.required],
      telephone: ['', [Validators.pattern(/^[0-9+\s\-()]{8,15}$/)]],
      email: ['', [Validators.email]],

      // Etape 2 — Informations médicales
      groupeSanguin: [''],
      allergies: [''],
      antecedents: [''],

      // Etape 3 — Administratif
      adresse: [''],
      mutuelle: [''],
      numeroMutuelle: [''],
      contactUrgenceNom: [''],
      contactUrgenceTel: ['', [Validators.pattern(/^[0-9+\s\-()]{8,15}$/)]],
      notesGenerales: [''],
    });
  }

  private initSearch(): void {}

  // Validator : date doit être dans le passé
  private datePasseeValidator(control: AbstractControl) {
    if (!control.value) return null;
    const date = new Date(control.value);
    return date < new Date() ? null : { dateInvalide: true };
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length < 3) {
      this.showSearchResults = false;
      return;
    }
    this.searchQuery = query;
    this.searchSubject.next(query);
    this.patientService.findAll(0, 5, query).subscribe((res) => {
      this.searchResults = res.content;
      this.showSearchResults = true;
    });
  }

  selectionnerPatient(patient: any): void {
    this.loading = true;
    this.showSearchResults = false;
    this.patientService.findById(patient.id).subscribe({
      next: (p) => {
        this.remplirFormulaire(p);
        this.mode = 'modification';
        this.employeId = p.id;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private remplirFormulaire(p: Patient): void {
    this.form = this.fb.group({
      // Etape 1 — Identité
      nom: [
        p.nom || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      prenom: [
        p.prenom || '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      dateNaissance: [
        p.dateNaissance || '',
        [Validators.required, this.datePasseeValidator],
      ],
      sexe: [p.sexe || '', Validators.required],
      telephone: [
        p.telephone || '',
        [Validators.pattern(/^[0-9+\s\-()]{8,15}$/)],
      ],
      email: [p.email || '', [Validators.email]],

      // Etape 2 — Informations médicales
      groupeSanguin: [p.groupeSanguin || ''],
      allergies: [p.allergies || ''],
      antecedents: [p.antecedents || ''],

      // Etape 3 — Administratif
      adresse: [p.adresse || ''],
      mutuelle: [p.mutuelle || ''],
      numeroMutuelle: [p.numeroMutuelle || ''],
      contactUrgenceNom: [p.contactUrgenceNom || ''],
      contactUrgenceTel: [
        p.contactUrgenceTel || '',
        [Validators.pattern(/^[0-9+\s\-()]{8,15}$/)],
      ],
      notesGenerales: [p.notesGenerales || ''],
    });
  }

  private chargerPatient(id: string): void {
    console.log('CHARGEMENT DU PATIENT:', id);
    this.loading = true;
    this.patientService.findById(id).subscribe({
      next: (p) => {
        this.remplirFormulaire(p);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Patient introuvable.';
      },
    });
  }

  // Navigation entre étapes
  stepSuivant(): void {
    if (this.currentStep < this.totalSteps && this.etapeValide()) {
      this.currentStep++;
    }
  }

  stepPrecedent(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  etapeValide(): boolean {
    if (this.currentStep === 1) {
      return ['nom', 'prenom', 'dateNaissance', 'sexe'].every(
        (field) => this.form.get(field)?.valid,
      );
    }
    return true;
  }

  // Getters pour les erreurs
  get nomInvalid() {
    return this.form.get('nom')?.invalid && this.form.get('nom')?.touched;
  }
  get prenomInvalid() {
    return this.form.get('prenom')?.invalid && this.form.get('prenom')?.touched;
  }
  get dateInvalid() {
    return (
      this.form.get('dateNaissance')?.invalid &&
      this.form.get('dateNaissance')?.touched
    );
  }
  get sexeInvalid() {
    return this.form.get('sexe')?.invalid && this.form.get('sexe')?.touched;
  }
  get telInvalid() {
    return (
      this.form.get('telephone')?.invalid && this.form.get('telephone')?.touched
    );
  }
  get emailInvalid() {
    return this.form.get('email')?.invalid && this.form.get('email')?.touched;
  }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const data = this.form.value;

    const op =
      this.mode === 'modification' && this.employeId
        ? this.patientService.edit(this.employeId, data)
        : this.patientService.create(data);

    op.subscribe({
      next: (employe) => {
        this.saving = false;
        this.successMessage =
          this.mode === 'creation'
            ? `Employé ${employe.prenom} ${employe.nom} enregistré avec succès.`
            : 'Fiche employé mise à jour.';
        setTimeout(() => this.router.navigate(['/employes', employe.id]), 1500);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Une erreur est survenue.';
      },
    });
  }

  reinitialiser(): void {
    this.form.reset();
    this.currentStep = 1;
    this.mode = 'creation';
    this.employeId = undefined;
    this.searchQuery = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
