import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { ProgressBarModule } from 'primeng/progressbar';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Page, ServiceError } from '../../../core/models/all/all.model';
import {
  Medicament,
  StockStats,
  FORMES,
  MOTIFS_MOUVEMENT,
} from '../../../core/models/pharmacie/medicament.model';
import { MedicamentService } from '../../../core/services/pharmacie/medicament.service';
import { CommonService } from '../../../core/services/common.services';
import { AppConfirmationService } from '../../../core/services/global/app.confirmation.service';
import { Entite } from '../../../core/models/enums/enums.model';

@Component({
  selector: 'clnt-pharmacie',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule,
    TooltipModule,
    MessageModule,
    TabsModule,
    ProgressBarModule,
    DatePickerModule,
  ],
  providers: [MessageService, AppConfirmationService],
  templateUrl: './pharmacie.component.html',
  styleUrls: ['./pharmacie.component.scss'],
})
export class PharmacieComponent implements OnInit, OnDestroy {
  private svc = inject(MedicamentService);
  private msg = inject(MessageService);
  private commonService = inject(CommonService);
  private confirm = inject(AppConfirmationService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  today = new Date();

  // ── State liste ───────────────────────────────────────
  medicaments = signal<Medicament[]>([]);
  page = signal<Page<Medicament> | null>(null);
  stats = signal<StockStats | null>(null);
  loading = signal(true);
  loadError = signal<string | null>(null);
  searchQuery = '';
  filterActif = signal<boolean | undefined>(true);
  pageIndex = signal(0);

  readonly pageSize = 20;
  devise = this.commonService.deviseMonnetaire();

  activeTab = signal(0);

  // Computed
  total = computed(() => this.page()?.page.totalElements ?? 0);

  // ── Dialogs ───────────────────────────────────────────
  showFormDialog = signal(false);
  showMouvementDialog = signal(false);
  editMode = signal(false);
  selectedMed = signal<Medicament | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  // ── Formulaire médicament ─────────────────────────────
  formes = FORMES;
  form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    denomination: [''],
    forme: [''],
    dosageUnitaire: [''],
    stockActuel: [0, [Validators.required, Validators.min(0)]],
    stockMinimum: [10, [Validators.required, Validators.min(0)]],
    prixUnitaire: [null as number | null],
    fournisseur: [''],
    dateExpiration: [null as Date | null],
    actif: [true],
  });

  // ── Formulaire mouvement ──────────────────────────────
  motifs = MOTIFS_MOUVEMENT;
  mouvementForm = this.fb.group({
    quantite: [null as number | null, [Validators.required]],
    motif: ['', Validators.required],
    reference: [''],
  });

  ngOnInit() {
    this.load();

    this.loadStats();
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        console.log('Valeur après RxJS :', q);
        this.searchQuery = q ?? '';
        console.log('searchQuery avant load :', this.searchQuery);
        this.load(0);
      });
  }

  load(p = 0) {
    this.loading.set(true);
    this.loadError.set(null);
    console.log('searchQuery dans le load :', this.searchQuery);
    this.svc
      .findAll(p, this.pageSize, this.searchQuery, this.filterActif())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.page.set(page);
          this.medicaments.set(page.content);
          this.loading.set(false);
        },
        error: (e: ServiceError) => {
          this.loading.set(false);
          this.loadError.set(e.message);
        },
      });
  }

  loadStats() {
    this.svc
      .getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (s) => this.stats.set(s), error: () => {} });
  }

  onSearch(q: string) {
    console.log('onSearch reçu :', q);
    this.search$.next(q);
  }
  onFilterActif(v: any) {
    this.filterActif.set(v);
    this.load();
  }
  onLazyLoad(e: any) {
    this.pageIndex.set(e.first / this.pageSize);
    this.load(this.pageIndex());
  }
  retryLoad() {
    this.load(this.pageIndex());
  }

  // ── Formulaire CRUD ───────────────────────────────────
  openCreation() {
    this.editMode.set(false);
    this.selectedMed.set(null);
    this.formError.set(null);
    this.form.reset({ stockActuel: 0, stockMinimum: 10, actif: true });
    this.showFormDialog.set(true);
  }

  ouvrirModification(m: Medicament) {
    this.editMode.set(true);
    this.selectedMed.set(m);
    this.formError.set(null);
    this.form.patchValue({
      nom: m.nom,
      denomination: m.denomination ?? '',
      forme: m.forme ?? '',
      dosageUnitaire: m.dosageUnitaire ?? '',
      stockActuel: m.stockActuel,
      stockMinimum: m.stockMinimum,
      prixUnitaire: m.prixUnitaire ?? null,
      fournisseur: m.fournisseur ?? '',
      dateExpiration: m.dateExpiration ? new Date(m.dateExpiration) : null,
      actif: m.actif,
    });
    this.showFormDialog.set(true);
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.formError.set(null);
    const data = { ...this.form.value } as any;
    if (data.dateExpiration) {
      /*data.dateExpiration = (data.dateExpiration as Date)
        .toISOString()
        .split('T')[0];*/
    }
    const op =
      this.editMode() && this.selectedMed()
        ? this.svc.edit(this.selectedMed()!.id, data)
        : this.svc.create(data);
    op.pipe(takeUntil(this.destroy$)).subscribe({
      next: (m) => {
        this.saving.set(false);
        this.showFormDialog.set(false);
        this.msg.add({
          severity: 'success',
          summary: this.editMode() ? 'Modifié' : 'Ajouté',
          detail: `${m.nom} ${this.editMode() ? 'mis à jour' : 'ajouté'}.`,
        });
        this.load(this.pageIndex());
        this.loadStats();
      },
      error: (e: ServiceError) => {
        this.saving.set(false);
        this.formError.set(e.message);
      },
    });
  }

  confirmDelete(m: Medicament) {
    this.confirm.action(
      'Désactiver le médicament',
      `Désactiver <strong>${m.nom}</strong> ?<br>Il ne sera plus visible dans les listes actives.`,
      () => {
        this.svc
          .delete(m.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.msg.add({
                severity: 'success',
                summary: 'Désactivé',
                detail: `${m.nom} désactivé.`,
              });
              this.load(this.pageIndex());
              this.loadStats();
            },
            error: (e: ServiceError) =>
              this.msg.add({
                severity: 'error',
                summary: 'Erreur',
                detail: e.message,
                life: 5000,
              }),
          });
      },
    );
  }

  // ── Mouvement de stock ────────────────────────────────
  openMovement(m: Medicament) {
    this.selectedMed.set(m);
    this.formError.set(null);
    this.mouvementForm.reset();
    this.showMouvementDialog.set(true);
  }

  submitMovement() {
    this.mouvementForm.markAllAsTouched();
    if (this.mouvementForm.invalid || !this.selectedMed()) return;
    this.saving.set(true);
    this.formError.set(null);
    const v = this.mouvementForm.value;
    this.svc
      .mouvement({
        medicamentId: this.selectedMed()!.id,
        quantite: v.quantite!,
        motif: v.motif as any,
        reference: v.reference || undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.showMouvementDialog.set(false);
          this.medicaments.update((list) =>
            list.map((m) => (m.id === updated.id ? updated : m)),
          );
          this.msg.add({
            severity: 'success',
            summary: 'Stock mis à jour',
            detail: `${updated.nom} — nouveau stock : ${updated.stockActuel}`,
          });
          this.loadStats();
        },
        error: (e: ServiceError) => {
          this.saving.set(false);
          this.formError.set(e.message);
        },
      });
  }

  // ── Helpers ───────────────────────────────────────────

  getStatutSeverity(s: string): string {
    return this.commonService.getStatutSeverity(s, Entite.MEDICAMENT);
  }

  getStatutLabel(s: string): string {
    return this.commonService.getStatutLabel(s, Entite.MEDICAMENT);
  }

  getStockPct(m: Medicament): number {
    if (!m.stockMinimum) return 100;
    return Math.min(
      100,
      Math.round((m.stockActuel / (m.stockMinimum * 2)) * 100),
    );
  }

  getStockBarColor(m: Medicament): string {
    if (m.statutStock === 'RUPTURE') return '#a32d2d';
    if (m.statutStock === 'ALERTE') return '#ba7517';
    return '#0f6e56';
  }

  hasError(name: string, ctrl: FormGroup = this.form) {
    const c = ctrl.get(name);
    return c && (c.dirty || c.touched) && c.invalid;
  }

  fieldError(name: string, ctrl: FormGroup = this.form): string {
    const c = ctrl.get(name);
    if (!c || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Obligatoire.';
    if (c.errors?.['minlength'])
      return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors?.['min']) return `Minimum ${c.errors['min'].min}.`;
    return '';
  }

  filterOptions = [
    { label: 'Actifs seulement', value: true },
    { label: 'Inactifs seulement', value: false },
    { label: 'Tous', value: undefined },
  ];

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  mouvementQte() {
    return Math.abs(this.mouvementForm.get('quantite')?.value || 1);
  }

  mouvementStockClass(m: Medicament): string {
    switch (m.statutStock) {
      case 'DISPONIBLE':
        return 'stock-ok';

      case 'ALERTE':
        return 'stock-warn';

      case 'RUPTURE':
        return 'stock-err';

      default:
        return '';
    }
  }
}
