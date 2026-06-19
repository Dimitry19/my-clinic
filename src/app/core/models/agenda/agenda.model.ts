import { StatutRendezVous } from '../enums/enums.model';

export interface RendezVous {
  id: string;
  patientNom: string;
  patientPrenom: string;
  patientId: string;
  medecinNom: string;
  medecinId: string;
  dateHeure: string; // ISO string
  dureeMinutes: number;
  motif: string;
  statut: StatutRendezVous;
  notes?: string;
}

export interface RdvRequest {
  patientId: string;
  medecinId: string;
  dateHeure: string;
  dureeMinutes: number;
  motif: string;
  notes?: string;
}

export interface CalendarDay {
  date: Date;
  rdvs: RendezVous[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const RDV_STATUT_CONFIG: Record<
  StatutRendezVous,
  { label: string; severity: string; icon: string }
> = {
  PLANIFIE: { label: 'Planifié', severity: 'info', icon: 'pi-clock' },
  CONFIRME: { label: 'Confirmé', severity: 'success', icon: 'pi-check-circle' },
  ANNULE: { label: 'Annulé', severity: 'danger', icon: 'pi-times-circle' },
  TERMINE: { label: 'Terminé', severity: 'secondary', icon: 'pi-check' },
  ABSENT: { label: 'Absent', severity: 'warn', icon: 'pi-exclamation-circle' },
  A_REASSIGNER: {
    label: 'A réassigner',
    severity: 'warn',
    icon: 'pi-exclamation-circle',
  },
};
