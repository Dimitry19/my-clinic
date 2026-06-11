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
  StatutRdv,
  STATUT_CONFIG,
} from '../../../core/models/agenda/agenda.model';

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
  selector: 'app-agenda',
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
  private confirm = inject(ConfirmationService);
  private fb = inject(FormBuilder);

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
    () => this.rdvs().filter((r) => r.statut === 'CONFIRME').length,
  );
  rdvEnAttente = computed(
    () => this.rdvs().filter((r) => r.statut === 'PLANIFIE').length,
  );

  statutOptions = Object.entries(STATUT_CONFIG).map(([v, c]) => ({
    label: c.label,
    value: v,
  }));
  statutConfig = STATUT_CONFIG;

  // ── Formulaire ────────────────────────────────────────
  form = this.fb.group({
    patientId: ['', Validators.required],
    medecinId: ['', Validators.required],
    dateHeure: ['', Validators.required],
    dureeMinutes: [30, [Validators.required, Validators.min(5)]],
    motif: ['', [Validators.required, Validators.minLength(3)]],
    notes: [''],
  });

  // Données mock pour les selects — à remplacer par de vrais appels API
  patients = [
    { label: 'Marie Kouassi', value: '1' },
    { label: 'Paul Dupont', value: '2' },
    { label: 'Awa Ly', value: '3' },
  ];
  medecins = [
    { label: 'Dr. Martin', value: '1' },
    { label: 'Dr. Dupont', value: '2' },
  ];

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
        statut: 'EN_COURS' as any,
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
    this.charger();
  }

  charger() {
    this.loading.set(true);
    this.loadError.set(null);
    // Simulation — remplacer par this.svc.findByMois(...)
    setTimeout(() => {
      this.rdvs.set(this.mockRdvs);
      this.loading.set(false);
    }, 600);
  }

  // ── Navigation ────────────────────────────────────────
  moisPrecedent() {
    const d = new Date(this.dateNavigation());
    d.setMonth(d.getMonth() - 1);
    this.dateNavigation.set(d);
    this.charger();
  }

  moisSuivant() {
    const d = new Date(this.dateNavigation());
    d.setMonth(d.getMonth() + 1);
    this.dateNavigation.set(d);
    this.charger();
  }

  allerAujourdhui() {
    this.dateNavigation.set(new Date());
    this.charger();
  }

  // ── Sélection jour ────────────────────────────────────
  selectionnerJour(day: CalendarDay) {
    this.jourSelectionne.set(day.date);
  }

  // ── Dialogs ───────────────────────────────────────────
  ouvrirCreation(date?: Date) {
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

  ouvrirDetail(rdv: RendezVous, event: Event) {
    event.stopPropagation();
    this.detailRdv.set(rdv);
    this.showDetail.set(true);
  }

  ouvrirModification(rdv: RendezVous) {
    this.editMode.set(true);
    this.selectedRdv.set(rdv);
    this.formError.set(null);
    this.form.patchValue({
      patientId: rdv.patientId,
      medecinId: rdv.medecinId,
      dateHeure: rdv.dateHeure.slice(0, 16),
      dureeMinutes: rdv.dureeMinutes,
      motif: rdv.motif,
      notes: rdv.notes ?? '',
    });
    this.showDetail.set(false);
    this.showDialog.set(true);
  }

  soumettre() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.formError.set(null);
    // Simulation
    setTimeout(() => {
      this.saving.set(false);
      this.showDialog.set(false);
      this.msg.add({
        severity: 'success',
        summary: this.editMode() ? 'RDV modifié' : 'RDV créé',
        detail: 'Rendez-vous enregistré avec succès.',
      });
      this.charger();
    }, 800);
  }

  changerStatut(rdv: RendezVous, statut: StatutRdv) {
    this.rdvs.update((list) =>
      list.map((r) => (r.id === rdv.id ? { ...r, statut } : r)),
    );
    if (this.detailRdv()?.id === rdv.id) this.detailRdv.set({ ...rdv, statut });
    this.msg.add({
      severity: 'success',
      summary: 'Statut mis à jour',
      detail: `Rendez-vous marqué comme ${STATUT_CONFIG[statut].label}.`,
    });
  }

  confirmerSuppression(rdv: RendezVous) {
    this.showDetail.set(false);
    this.confirm.confirm({
      header: 'Supprimer le rendez-vous',
      message: `Supprimer le RDV de ${rdv.patientPrenom} ${rdv.patientNom} ?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.rdvs.update((list) => list.filter((r) => r.id !== rdv.id));
        this.msg.add({
          severity: 'success',
          summary: 'Supprimé',
          detail: 'Rendez-vous supprimé.',
        });
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────
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
}
