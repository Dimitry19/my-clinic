import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  DEPARTEMENTS,
  Employe,
  EmployePage,
} from '../../../core/models/employe/employe.model';
import {
  EmployeService,
  ServiceError,
} from '../../../core/services/employe/employe.service';
import { CommonService } from '../../../core/services/common.services';
import { EmployeFormComponent } from './formulaire/employe-form.component';

@Component({
  selector: 'clnt-employes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    AvatarModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    DialogModule,
    TooltipModule,
    EmployeFormComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.scss'],
})
export class EmployesComponent implements OnInit {
  private service = inject(EmployeService);
  private commonService = inject(CommonService);
  private confirm = inject(ConfirmationService);
  private msg = inject(MessageService);
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  employes = signal<Employe[]>([]);
  page = signal<EmployePage | null>(null);
  loading = signal(true);
  listError = signal<string | null>(null);
  searchQuery = '';
  filterDept = signal<string>('');
  pageIndex = signal(0);
  readonly pageSize = 15;

  // Formulaire dialog
  showDialog = signal(false);
  editMode = signal(false);
  selectedEmploye = signal<Employe | null>(null);

  totalEmployes = computed(() => this.page()?.totalElements ?? 0);
  actifs = computed(
    () => this.employes().filter((e) => e.statut === 'ACTIF').length,
  );

  departementOptions = [
    { label: 'Tous les départements', value: '' },
    ...DEPARTEMENTS,
  ];

  ngOnInit() {
    //this.load();
    this.search$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((q) => {
          this.loading.set(true);
          this.listError.set(null);
          return this.service.findAll(0, this.pageSize, q, this.filterDept());
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (p) => {
          this.page.set(p);
          this.employes.set(p.content);
          this.loading.set(false);
        },
        error: (e: ServiceError) => {
          this.loading.set(false);
          this.listError.set(e.message);
        },
      });
  }

  load(p = 0) {
    this.loading.set(true);
    this.listError.set(null);
    this.service
      .findAll(p, this.pageSize, this.searchQuery, this.filterDept())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.page.set(page);
          this.employes.set(page.content);
          this.loading.set(false);
        },
        error: (e: ServiceError) => {
          this.loading.set(false);
          this.listError.set(e.message);
        },
      });
  }

  onSearch(q: string) {
    this.search$.next(q);
  }
  onFilterDept(v: string) {
    this.filterDept.set(v);
    this.load();
  }
  onLazyLoad(e: any) {
    this.pageIndex.set(e.first / this.pageSize);
    this.load(this.pageIndex());
  }

  // Boite de dialogue pour edition ou creation
  openCreate() {
    this.selectedEmploye.set(null);
    this.editMode.set(false);
    this.showDialog.set(true);
  }

  openEdit(e: Employe) {
    this.selectedEmploye.set({ ...e });
    this.editMode.set(true);
    this.showDialog.set(true);
  }

  onFormSaved(employe: Employe) {
    this.showDialog.set(false);
    this.msg.add({
      severity: 'success',
      summary: this.editMode() ? 'Mis à jour' : 'Créé',
      detail: `${employe.prenom} ${employe.nom} ${this.editMode() ? 'mis à jour' : 'ajouté'} avec succès.`,
    });
    this.load(this.pageIndex());
  }

  onFormError(err: ServiceError) {
    this.msg.add({
      severity: 'error',
      summary: 'Erreur',
      detail: err.message,
      life: 5000,
    });
  }

  confirmerSuppression(e: Employe) {
    this.confirm.confirm({
      header: 'Confirmer la suppression',
      message: `Supprimer l'employé <strong>${e.prenom} ${e.nom}</strong> ? Cette action est irréversible.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service
          .delete(e.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.msg.add({
                severity: 'success',
                summary: 'Supprimé',
                detail: `${e.prenom} ${e.nom} supprimé.`,
              });
              this.load(this.pageIndex());
            },
            error: (err: ServiceError) => {
              this.msg.add({
                severity: 'error',
                summary: 'Erreur',
                detail: err.message,
                life: 5000,
              });
            },
          });
      },
    });
  }

  // ── Changement de statut ──────────────────────────────
  toggleStatut(e: Employe) {
    const nouveau = e.statut === 'ACTIF' ? 'ACTIF' : 'INACTIF';
    const label = nouveau === 'INACTIF' ? 'réactiver' : 'désactiver';
    this.confirm.confirm({
      header: 'Modifier le statut',
      message: `Voulez-vous ${label} ${e.prenom} ${e.nom} ?`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.service
          .changeStatus(e.id, nouveau)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updated) => {
              this.employes.update((list) =>
                list.map((emp) => (emp.id === updated.id ? updated : emp)),
              );
              this.msg.add({
                severity: 'success',
                summary: 'Statut mis à jour',
                detail: `${e.prenom} ${e.nom} est maintenant ${nouveau === 'ACTIF' ? 'actif' : 'inactif'}.`,
              });
            },
            error: (err: ServiceError) => {
              this.msg.add({
                severity: 'error',
                summary: 'Erreur',
                detail: err.message,
                life: 5000,
              });
            },
          });
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────
  getInitiales(e: Employe): string {
    return this.commonService.getInitiales(e.prenom, e.nom);
  }

  getStatutSeverity(s: string) {
    return { ACTIF: 'success', INACTIF: 'danger' }[s] ?? 'secondary';
  }

  getContratSeverity(c: string) {
    return (
      { CDI: 'success', CDD: 'info', STAGE: 'warn', VACATAIRE: 'secondary' }[
        c
      ] ?? 'secondary'
    );
  }

  getDeptLabel(d: string) {
    return DEPARTEMENTS.find((x) => x.value === d)?.label ?? d;
  }

  getAvatarStyle(e: Employe) {
    const map: Record<string, { bg: string; color: string }> = {
      MEDECINE: { bg: '#e6f1fb', color: '#0c447c' },
      CHIRURGIE: { bg: '#e1f5ee', color: '#085041' },
      LABORATOIRE: { bg: '#eeedfe', color: '#26215c' },
      PHARMACIE: { bg: '#faeeda', color: '#633806' },
      ADMINISTRATION: { bg: '#f1efe8', color: '#5f5e5a' },
      COMPTABILITE: { bg: '#fcebeb', color: '#791f1f' },
      INFIRMERIE: { bg: '#e6f1fb', color: '#185fa5' },
      URGENCES: { bg: '#fcebeb', color: '#a32d2d' },
    };
    const s = map[e.departement] ?? { bg: '#e6f1fb', color: '#0c447c' };
    return { background: s.bg, color: s.color };
  }

  retryLoad() {
    this.load(this.pageIndex());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatutIcon(statut: string): string {
    return statut === 'ACTIF' ? 'pi pi-ban' : 'pi pi-check-circle';
  }
  getStatutLabel(statut: string): string {
    return statut === 'ACTIF' ? 'Désactiver' : 'Réactiver';
  }
  getDialogTitle(): string {
    return this.editMode() ? "Modifier l'employé" : 'Nouvel employé';
  } 
  getDialogSubtitle(): string {
    return this.editMode() ? "Mise à jour du dossier" : 'Création du dossier';
  }
}
