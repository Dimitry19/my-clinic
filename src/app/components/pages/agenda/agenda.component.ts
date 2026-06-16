import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AgendaService } from '../../../core/services/agenda/agenda.service';
import {
  RendezVous,
  CalendarDay,
  STATUT_CONFIG,
  RdvRequest,
} from '../../../core/models/agenda/agenda.model';

import { forkJoin, Subject } from 'rxjs';
import { ServiceError } from '../../../core/models/all/all.model';
import { StatutRendezVous } from '../../../core/models/enums/enums.model';
import { PatientService } from '../../../core/services/patient/patient.service';
import { Patient } from '../../../core/models/patient/patient.model';
import { Employe } from '../../../core/models/employe/employe.model';
import { EmployeService } from '../../../core/services/employe/employe.service';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

@Component({
  selector: 'clnt-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TagModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule,
    TooltipModule,
    MessageModule,
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss'],
})
export class AgendaComponent implements OnInit {
  private svc = inject(AgendaService);
  private msg = inject(MessageService);
  private patientService = inject(PatientService);
  private employeService = inject(EmployeService);
  private confirm = inject(ConfirmationService);
  private fb = inject(FormBuilder);

  patientSearchQuery = '';
  medecinSearchQuery = '';

  searchLoading = false;
  showSearchResults = false;
  showSearchMedecinResults = false;
  searchResults: Patient[] = [];
  searchMedecinResults: Employe[] = [];
  private searchSubject = new Subject<string>();

  // ── State calendrier ──────────────────────────────────
  aujourdhui = new Date();
  dateNavigation = signal(new Date());
  rdvs = signal<RendezVous[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);

  // ── Vue active ────────────────────────────────────────
  vue = signal<'mois' | 'semaine' | 'jour' | 'liste'>('mois');

  // ── Jour sélectionné ──────────────────────────────────
  jourSelectionne = signal<Date | null>(null);
  rdvJourSelectionne = computed(() => {
    const j = this.jourSelectionne();
    if (!j) return [];
    return this.rdvs()
      .filter((r) => {
        const d = new Date(r.dateHeure);
        return (
          d.getFullYear() === j.getFullYear() &&
          d.getMonth() === j.getMonth() &&
          d.getDate() === j.getDate()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime(),
      );
  });

  // ── Dialog RDV ────────────────────────────────────────
  showDialog = signal(false);
  editMode = signal(false);
  selectedRdv = signal<RendezVous | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  // ── Dialog détail ─────────────────────────────────────
  showDetail = signal(false);
  detailRdv = signal<RendezVous | null>(null);

  // ── Computed calendrier ───────────────────────────────
  moisLabel = computed(
    () =>
      `${MOIS[this.dateNavigation().getMonth()]} ${this.dateNavigation().getFullYear()}`,
  );
  joursLabel = JOURS;

  calendarDays = computed((): CalendarDay[] => {
    const nav = this.dateNavigation();
    const annee = nav.getFullYear();
    const mois = nav.getMonth();
    const premier = new Date(annee, mois, 1);
    const dernier = new Date(annee, mois + 1, 0);
    // Lundi = 0 dans notre grille
    let debutGrille = new Date(premier);
    const jourSemaine = (premier.getDay() + 6) % 7; // 0=lundi
    debutGrille.setDate(premier.getDate() - jourSemaine);

    const days: CalendarDay[] = [];
    const today = this.aujourdhui;
    const cursor = new Date(debutGrille);

    while (cursor <= dernier || days.length % 7 !== 0) {
      const d = new Date(cursor);
      days.push({
        date: d,
        rdvs: this.rdvs().filter((r) => {
          const rd = new Date(r.dateHeure);
          return (
            rd.getFullYear() === d.getFullYear() &&
            rd.getMonth() === d.getMonth() &&
            rd.getDate() === d.getDate()
          );
        }),
        isToday: d.toDateString() === today.toDateString(),
        isCurrentMonth: d.getMonth() === mois,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  });

  rdvAujourdhui = computed(() =>
    this.rdvs()
      .filter(
        (r) =>
          new Date(r.dateHeure).toDateString() ===
          this.aujourdhui.toDateString(),
      )
      .sort(
        (a, b) =>
          new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime(),
      ),
  );

  totalRdvsMois = computed(() => this.rdvs().length);
  rdvConfirmes = computed(
    () =>
      this.rdvs().filter((r) => r.statut === StatutRendezVous.CONFIRME).length,
  );
  rdvEnAttente = computed(
    () =>
      this.rdvs().filter((r) => r.statut === StatutRendezVous.PLANIFIE).length,
  );

  statutOptions = Object.entries(STATUT_CONFIG).map(([v, c]) => ({
    label: c.label,
    value: v,
  }));
  statutConfig = STATUT_CONFIG;

  // ── Formulaire ────────────────────────────────────────
  form = this.fb.group({
    patientId: ['', Validators.required],
    patientNom: ['', Validators.required],
    medecinId: ['', Validators.required],
    medecinNom: ['', Validators.required],
    dateHeure: ['', Validators.required],
    dureeMinutes: [30, [Validators.required, Validators.min(5)]],
    motif: ['', [Validators.required, Validators.minLength(3)]],
    notes: [''],
  });

  // ── Données mock pour la démo ─────────────────────────
  private mockRdvs: RendezVous[] = (() => {
    const now = new Date();
    const y = now.getFullYear(),
      m = now.getMonth();
    return [
      {
        id: '1',
        patientNom: 'Kouassi',
        patientPrenom: 'Marie',
        patientId: '1',
        medecinNom: 'Dr. Martin',
        medecinId: '1',
        dateHeure: new Date(y, m, now.getDate(), 9, 0).toISOString(),
        dureeMinutes: 30,
        motif: 'Fièvre persistante',
        statut: 'PLANIFIE' as any,
      },
      {
        id: '2',
        patientNom: 'Dupont',
        patientPrenom: 'Paul',
        patientId: '2',
        medecinNom: 'Dr. Martin',
        medecinId: '1',
        dateHeure: new Date(y, m, now.getDate(), 10, 30).toISOString(),
        dureeMinutes: 30,
        motif: 'Bilan de santé',
        statut: 'PLANIFIE',
      },
      {
        id: '3',
        patientNom: 'Ly',
        patientPrenom: 'Awa',
        patientId: '3',
        medecinNom: 'Dr. Dupont',
        medecinId: '2',
        dateHeure: new Date(y, m, now.getDate(), 14, 0).toISOString(),
        dureeMinutes: 45,
        motif: 'Suivi diabète',
        statut: 'CONFIRME',
      },
      {
        id: '4',
        patientNom: 'Bernard',
        patientPrenom: 'Jean',
        patientId: '4',
        medecinNom: 'Dr. Martin',
        medecinId: '1',
        dateHeure: new Date(y, m, now.getDate() + 2, 9, 0).toISOString(),
        dureeMinutes: 30,
        motif: 'Contrôle tension',
        statut: 'PLANIFIE',
      },
      {
        id: '5',
        patientNom: 'Louis',
        patientPrenom: 'Anna',
        patientId: '5',
        medecinNom: 'Dr. Dupont',
        medecinId: '2',
        dateHeure: new Date(y, m, now.getDate() + 2, 11, 0).toISOString(),
        dureeMinutes: 30,
        motif: 'Consultation',
        statut: 'CONFIRME',
      },
      {
        id: '6',
        patientNom: 'Moreau',
        patientPrenom: 'Luc',
        patientId: '6',
        medecinNom: 'Dr. Martin',
        medecinId: '1',
        dateHeure: new Date(y, m, now.getDate() - 3, 10, 0).toISOString(),
        dureeMinutes: 30,
        motif: 'Grippe',
        statut: 'TERMINE',
      },
    ];
  })();

  ngOnInit() {
    this.load();
  }

  recuperationsParallesDesDonnees(
    annee: number,
    mois: number,
    medecinId: string,
  ) {
    forkJoin({
      rendezVous: this.svc.findAgendaByPeriode(annee, mois, medecinId),
    }).subscribe({
      next: ({ rendezVous }) => {
        this.rdvs.set(rendezVous);
        this.loading.set(false);
      },
      error: (err: ServiceError) => {
        this.loading.set(false);
        this.loadError.set(err.message);
      },
    });
  }

  load() {
    this.loading.set(true);
    this.loadError.set(null);
    this.svc
      .findAgendaByPeriode(this.getCurrentYear(), this.getCurrentMonth(), '')
      .subscribe({
        next: (rendezVous: RendezVous[]) => {
          this.rdvs.set(rendezVous);
          this.loading.set(false);
        },
        error: (err: ServiceError) => {
          this.loading.set(false);
          this.loadError.set(err.message);
        },
      });
  }

  // ── Navigation ────────────────────────────────────────
  previousMonth() {
    const d = new Date(this.dateNavigation());
    d.setMonth(d.getMonth() - 1);
    this.dateNavigation.set(d);
    this.load();
  }

  nextMonth() {
    const d = new Date(this.dateNavigation());
    d.setMonth(d.getMonth() + 1);
    this.dateNavigation.set(d);
    this.load();
  }

  goToToday() {
    this.dateNavigation.set(new Date());
    this.load();
  }

  // ── Sélection jour ────────────────────────────────────
  selectDay(day: CalendarDay) {
    this.jourSelectionne.set(day.date);
  }

  // ── Dialogs ───────────────────────────────────────────
  openCreation(date?: Date) {
    this.editMode.set(false);
    this.selectedRdv.set(null);
    this.formError.set(null);
    this.form.reset({ dureeMinutes: 30 });
    if (date) {
      const iso = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        9,
        0,
      )
        .toISOString()
        .slice(0, 16);
      this.form.patchValue({ dateHeure: iso });
    }
    this.showDialog.set(true);
  }

  openDetail(rdv: RendezVous, event: Event) {
    event.stopPropagation();
    this.detailRdv.set(rdv);
    this.showDetail.set(true);
  }

  openEdit(rdv: RendezVous) {
    this.editMode.set(true);
    this.selectedRdv.set(rdv);
    this.formError.set(null);
    this.form.patchValue({
      patientId: rdv.patientId,
      medecinId: rdv.medecinId,
      patientNom: rdv.patientNom + ' ' + rdv.patientPrenom,
      medecinNom: rdv.medecinNom,
      dateHeure: rdv.dateHeure.slice(0, 16),
      dureeMinutes: rdv.dureeMinutes,
      motif: rdv.motif,
      notes: rdv.notes ?? '',
    });
    this.showDetail.set(false);
    this.showDialog.set(true);
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.formError.set(null);

    const data = this.form.value as Partial<RdvRequest>;

    if (this.editMode()) {
      this.svc.edit(this.selectedRdv()!.id, data).subscribe({
        next: () => {
          this.saving.set(false);
          this.showDialog.set(false);
          this.msg.add({
            severity: 'success',
            summary: this.editMode() ? 'RDV modifié' : 'RDV créé',
            detail: 'Rendez-vous enregistré avec succès.',
          });
          this.load();
        },
        error: (err: ServiceError) => {
          this.saving.set(false);
          this.loading.set(false);
          this.loadError.set(err.message);
        },
      });
    } else {
      this.svc.create(data).subscribe({
        next: () => {
          this.saving.set(false);
          this.showDialog.set(false);
          this.msg.add({
            severity: 'success',
            summary: this.editMode() ? 'RDV modifié' : 'RDV créé',
            detail: 'Rendez-vous enregistré avec succès.',
          });
          this.load();
        },
        error: (err: ServiceError) => {
          this.saving.set(false);
          this.loading.set(false);
          this.loadError.set(err.message);
        },
      });
    }
  }

  changeStatus(rdv: RendezVous, statut: StatutRendezVous) {
    this.svc.updateStatus(rdv.id, statut).subscribe({
      next: () => {
        this.rdvs.update((list) =>
          list.map((r) => (r.id === rdv.id ? { ...r, statut } : r)),
        );
        if (this.detailRdv()?.id === rdv.id)
          this.detailRdv.set({ ...rdv, statut });
        this.msg.add({
          severity: 'success',
          summary: 'Statut mis à jour',
          detail: `Rendez-vous marqué comme ${STATUT_CONFIG[statut].label}.`,
        });
      },
      error: (err: ServiceError) => {
        this.saving.set(false);
        this.loading.set(false);
        this.loadError.set(err.message);
      },
    });
  }

  confirmDelete(rdv: RendezVous) {
    this.showDetail.set(false);
    this.confirm.confirm({
      header: 'Supprimer le rendez-vous',
      message: `Supprimer le RDV de ${rdv.patientPrenom} ${rdv.patientNom} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.svc.delete(rdv.id).subscribe({
          next: () => {
            this.rdvs.update((list) => list.filter((r) => r.id !== rdv.id));
            this.msg.add({
              severity: 'success',
              summary: 'Supprimé',
              detail: 'Rendez-vous supprimé.',
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
  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length < 3) {
      this.showSearchResults = false;
      return;
    }
    this.patientSearchQuery = query;
    this.searchSubject.next(query);
    this.patientService.findAll(0, 5, query).subscribe((res) => {
      this.searchResults = res.content;
      this.showSearchResults = true;
    });
  }

  selectPatient(patient: Patient): void {
    this.loading.set(true);
    this.showSearchResults = false;
    this.patientService.findById(patient.id).subscribe({
      next: (p) => {
        this.onPatientSelected(p);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSearchMedecinInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    if (query.length < 3) {
      this.showSearchMedecinResults = false;
      return;
    }
    this.medecinSearchQuery = query;
    this.searchSubject.next(query);
    this.employeService.findAll(0, 5, query).subscribe((res) => {
      this.searchMedecinResults = res.content;
      this.showSearchMedecinResults = true;
    });
  }
  selectMedecin(medecin: Employe): void {
    this.loading.set(true);
    this.showSearchResults = false;
    this.employeService.findById(medecin.id).subscribe({
      next: (e) => {
        this.onMedecinSelected(e);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────

  onPatientSelected(patient: Patient): void {
    this.form.patchValue({
      patientId: patient.id,
      patientNom: `${patient.prenom} ${patient.nom}`,
    });
    this.showSearchResults = false;

    this.form.get('patientNom')?.disable();
  }

  onMedecinSelected(medecin: Employe): void {
    this.form.patchValue({
      medecinId: medecin.id,
      medecinNom: `${medecin.prenom} ${medecin.nom}`,
    });
    this.showSearchMedecinResults = false;
    this.form.get('medecinNom')?.disable();
  }
  formatHeure(iso: string) {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  getInitiales(rdv: RendezVous) {
    return `${rdv.patientPrenom[0]}${rdv.patientNom[0]}`.toUpperCase();
  }

  fieldError(name: string): string {
    const c = this.form.get(name);
    if (!c || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Ce champ est obligatoire.';
    if (c.errors?.['minlength'])
      return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors?.['min']) return 'Valeur minimale non respectée.';
    return '';
  }

  hasError(name: string) {
    const c = this.form.get(name);
    return c && (c.dirty || c.touched) && c.invalid;
  }

  getCurrentMonth(): number {
    return this.dateNavigation().getMonth();
  }
  getCurrentYear(): number {
    return this.dateNavigation().getFullYear();
  }
}
