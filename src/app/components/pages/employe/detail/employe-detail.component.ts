import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Patient } from '../../../../core/models/all/all.model';
import { PatientService } from '../../../../core/services/patient/patient.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TooltipModule } from 'primeng/tooltip';

interface Consultation {
  id: string;
  date: Date;
  medecin: string;
  motif: string;
  diagnostic: string;
  statut: string;
}
interface ExamenLabo {
  id: string;
  date: Date;
  type: string;
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE';
  resultat?: string;
}
interface Facture {
  id: string;
  date: Date;
  montant: number;
  paye: number;
  statut: 'IMPAYEE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE';
}
interface Ordonnance {
  id: string;
  date: Date;
  medecin: string;
  medicaments: string[];
}

@Component({
  selector: 'clnt-employe-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TabsModule,
    ButtonModule,
    TagModule,
    CardModule,
    SkeletonModule,
    TableModule,
    TimelineModule,
    AvatarModule,
    DividerModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './employe-detail.component.html',
  styleUrls: ['./employe-detail.component.scss'],
})
export class EmployeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private patientSvc = inject(PatientService);
  private msgSvc = inject(MessageService);

  patient = signal<Patient | null>(null);
  loading = signal(true);
  activeTab = signal(0);

  // Données simulées — à remplacer par de vrais services
  consultations = signal<Consultation[]>([
    {
      id: '1',
      date: new Date('2026-05-20'),
      medecin: 'Dr. Martin',
      motif: 'Fièvre persistante',
      diagnostic: 'Paludisme simple',
      statut: 'TERMINE',
    },
    {
      id: '2',
      date: new Date('2026-04-10'),
      medecin: 'Dr. Dupont',
      motif: 'Douleur abdominale',
      diagnostic: 'Gastrite',
      statut: 'TERMINE',
    },
    {
      id: '3',
      date: new Date('2026-03-02'),
      medecin: 'Dr. Martin',
      motif: 'Bilan de santé',
      diagnostic: 'RAS',
      statut: 'TERMINE',
    },
  ]);

  examens = signal<ExamenLabo[]>([
    {
      id: '1',
      date: new Date('2026-05-21'),
      type: 'NFS + Goutte épaisse',
      statut: 'TERMINE',
      resultat: 'Positif Pf',
    },
    {
      id: '2',
      date: new Date('2026-04-11'),
      type: 'Échographie abdominale',
      statut: 'TERMINE',
      resultat: 'Normal',
    },
    {
      id: '3',
      date: new Date('2026-06-01'),
      type: 'Glycémie à jeun',
      statut: 'EN_ATTENTE',
    },
  ]);

  factures = signal<Facture[]>([
    {
      id: '1',
      date: new Date('2026-05-20'),
      montant: 4500,
      paye: 4500,
      statut: 'PAYEE',
    },
    {
      id: '2',
      date: new Date('2026-04-10'),
      montant: 2800,
      paye: 1500,
      statut: 'PARTIELLEMENT_PAYEE',
    },
    {
      id: '3',
      date: new Date('2026-06-01'),
      montant: 1200,
      paye: 0,
      statut: 'IMPAYEE',
    },
  ]);

  ordonnances = signal<Ordonnance[]>([
    {
      id: '1',
      date: new Date('2026-05-20'),
      medecin: 'Dr. Martin',
      medicaments: [
        'Artéméther-Luméfantrine 80/480mg — 1cp matin et soir 3j',
        'Paracétamol 1g — 1cp toutes les 8h si fièvre',
      ],
    },
    {
      id: '2',
      date: new Date('2026-04-10'),
      medecin: 'Dr. Dupont',
      medicaments: [
        'Oméprazole 20mg — 1cp avant repas 14j',
        'Antiacide — 2cp après repas 7j',
      ],
    },
  ]);

  timeline = signal<any[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.patientSvc.findById(id).subscribe({
      next: (p) => {
        this.patient.set(p);
        this.loading.set(false);
        this.buildTimeline();
      },
      error: () => {
        this.loading.set(false);
        this.msgSvc.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Patient introuvable.',
        });
      },
    });
  }

  private buildTimeline() {
    const events = [
      ...this.consultations().map((c) => ({
        date: c.date,
        icon: 'ti ti-stethoscope',
        color: '#185FA5',
        title: c.motif,
        subtitle: c.medecin,
        type: 'consultation',
      })),
      ...this.examens().map((e) => ({
        date: e.date,
        icon: 'ti ti-flask',
        color: '#0F6E56',
        title: e.type,
        subtitle: e.resultat ?? 'En attente',
        type: 'examen',
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());
    this.timeline.set(events);
  }

  get age(): number {
    const p = this.patient();
    if (!p) return 0;
    const diff = Date.now() - new Date(p.dateNaissance).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  get initiales(): string {
    const p = this.patient();
    return p ? `${p.prenom[0]}${p.nom[0]}`.toUpperCase() : '??';
  }

  get soldeDu(): number {
    return this.factures()
      .filter((f) => f.statut !== 'PAYEE')
      .reduce((acc, f) => acc + (f.montant - f.paye), 0);
  }

  getSexeLabel(s: string) {
    return s === 'M' ? 'Homme' : s === 'F' ? 'Femme' : 'Autre';
  }

  getFactureSeverity(s: string) {
    return (
      { PAYEE: 'success', PARTIELLEMENT_PAYEE: 'warn', IMPAYEE: 'danger' }[s] ??
      'secondary'
    );
  }

  getExamenSeverity(s: string) {
    return (
      { TERMINE: 'success', EN_COURS: 'info', EN_ATTENTE: 'warn' }[s] ??
      'secondary'
    );
  }

  copierId() {
    navigator.clipboard.writeText(this.patient()?.id ?? '');
    this.msgSvc.add({
      severity: 'info',
      summary: 'Copié',
      detail: 'ID patient copié.',
      life: 2000,
    });
  }

  imprimerFiche() {
    window.print();
  }
}
