import {
  Component,
  inject,
  input,
  OnInit,
  signal,
  computed,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import { ExamenLabo } from '../../../../core/models/laboratoire/laboratoire.model';
import { CommonService } from '../../../../core/services/common.services';
import { ServiceError } from '../../../../core/models/all/all.model';
import {
  ResultatLabo,
  ParametreResultat,
  ResultatLaboRequest,
} from '../../../../core/models/laboratoire/resultat.labo.model';
import { ResultatLaboService } from '../../../../core/services/laboratoire/resultat.labo.service';

@Component({
  selector: 'clnt-resultat-labo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    ToastModule,
    SkeletonModule,
    TooltipModule,
    CheckboxModule,
  ],
  providers: [MessageService],
  templateUrl: './resultat-labo.component.html',
  styleUrls: ['./resultat-labo.component.scss'],
})
export class ResultatLaboComponent implements OnInit {
  // ── Inputs / Outputs ─────────────────────────────────────
  examen = input.required<ExamenLabo>();
  laborantinId = input.required<string>(); // ID de l'utilisateur connecté
  saved = output<ResultatLabo>(); // notifie le parent après sauvegarde
  loaded = output<ResultatLabo | null>();

  private svc = inject(ResultatLaboService);
  private msg = inject(MessageService);
  private commonSvc = inject(CommonService);
  private fb = inject(FormBuilder);

  // ── État ─────────────────────────────────────────────────
  resultat = signal<ResultatLabo | null>(null);
  loading = signal(true);
  saving = signal(false);
  editMode = signal(false);

  // ── Formulaire ───────────────────────────────────────────
  form!: FormGroup;

  // ── Computed ─────────────────────────────────────────────
  hasResultat = computed(() => this.resultat() !== null);
  parametres = computed(() => this.resultat()?.parametres ?? []);
  anyAnormal = computed(() => this.parametres().some((p) => p.anormal));

  get parametresArray(): FormArray {
    return this.form.get('parametres') as FormArray;
  }

  // ── Init ─────────────────────────────────────────────────
  ngOnInit() {
    this.initForm();
    this.loadResultat();
  }

  private initForm(resultat?: ResultatLabo): void {
    const parametres = resultat?.parametres ?? [];
    this.form = this.fb.group({
      interpretation: [resultat?.interpretation ?? ''],
      parametres: this.fb.array(
        parametres.length > 0
          ? parametres.map((p) => this.buildParametreGroup(p))
          : [this.buildParametreGroup()],
      ),
    });
  }

  private buildParametreGroup(p?: Partial<ParametreResultat>): FormGroup {
    return this.fb.group({
      libelle: [p?.libelle ?? '', Validators.required],
      valeur: [p?.valeur ?? '', Validators.required],
      unite: [p?.unite ?? ''],
      norme: [p?.norme ?? ''],
      anormal: [p?.anormal ?? false],
    });
  }

  private loadResultat(): void {
    this.loading.set(true);
    this.svc.findByExamen(this.examen().id).subscribe({
      next: (r) => {
        this.resultat.set(r);
        this.loading.set(false);
         this.loaded.emit(r); 
      },
      error: () => {
        // Pas de résultat encore — état normal
        this.resultat.set(null);
        this.loading.set(false);
         this.loaded.emit(null); 
      },
    });
  }

  // ── Actions ──────────────────────────────────────────────
  ouvrirEdition(): void {
    this.initForm(this.resultat() ?? undefined);
    this.editMode.set(true);
  }

  annuler(): void {
    this.editMode.set(false);
    this.form.reset();
  }

  ajouterParametre(): void {
    this.parametresArray.push(this.buildParametreGroup());
  }

  supprimerParametre(index: number): void {
    if (this.parametresArray.length > 1) {
      this.parametresArray.removeAt(index);
    }
  }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const req: ResultatLaboRequest = {
      examenId: this.examen().id,
      laborantinId: this.laborantinId(),
      parametres: this.form.value.parametres as ParametreResultat[],
      interpretation: this.form.value.interpretation || null,
    };

    const op$ = this.resultat()
      ? this.svc.edit(this.resultat()!.id, req)
      : this.svc.create(req);

    op$.subscribe({
      next: (r) => {
        this.resultat.set(r);
        this.saving.set(false);
        this.editMode.set(false);
        this.msg.add({
          severity: 'success',
          summary: 'Résultat enregistré',
          detail: "Le résultat de l'examen a été sauvegardé.",
        });
        this.saved.emit(r);
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.msg.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message,
        });
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return this.commonSvc.formatDate(iso);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
