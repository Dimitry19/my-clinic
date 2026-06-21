import { Departement } from '../employe/employe.model';

export const StatutConsultation = {
  PLANIFIEE: 'PLANIFIEE',
  EN_COURS: 'EN_COURS',
  TERMINEE: 'TERMINEE',
  ANNULEE: 'ANNULEE',
} as const;

export type StatutConsultation =
  (typeof StatutConsultation)[keyof typeof StatutConsultation];

export type TypeConsultation =
  | 'GENERALE'
  | 'SPECIALISEE'
  | 'URGENCE'
  | 'SUIVI'
  | 'BILAN';

export interface Consultation {
  id: string;
  patientId: string;
  patientNom: string;
  patientPrenom: string;
  age: number;
  medecinId: string;
  medecinNom: string;
  departement: string;
  rendezVousId: string;
  dateHeure: string;
  type: TypeConsultation;
  statut: StatutConsultation;
  motif: string;
  symptomes?: string;
  diagnostic?: string;
  traitement?: string;
  tension?: string;
  temperature?: number;
  poids?: number;
  taille?: number;
  notes?: string;
  dureeMinutes?: number;
}

export interface ConsultationRequest {
  patientId: string;
  medecinId: string;
  rendezVousId: string;
  type: TypeConsultation;
  dateHeure: string;
  motif: string;
  symptomes?: string;
  diagnostic?: string;
  traitement?: string;
  tension?: string;
  temperature?: number;
  poids?: number;
  taille?: number;
  notes?: string;
  dureeMinutes?: number;
}

export interface RendezVousLight {
  id: string;
  dateHeure: string;
  dureeMinutes: number;
  motif: string;
  statut: string;
  patientNom: string;
  patientPrenom: string;
  medecinNom: string;
}

export interface PatientLight {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  telephone?: string;
  groupeSanguin?: string;
  age: number;
}

export interface MedecinLight {
  id: string;
  utilisateurId: string;
  nom: string;
  prenom: string;
  poste: string;
  departement: string;
}

export interface ConsultationPage {
  content: Consultation[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const TYPES_CONSULTATION = [
  { label: 'Consultation générale', value: 'GENERALE' },
  { label: 'Consultation spécialisée', value: 'SPECIALISEE' },
  { label: 'Urgence', value: 'URGENCE' },
  { label: 'Suivi', value: 'SUIVI' },
  { label: 'Bilan', value: 'BILAN' },
];

export const CONS_DEPARTEMENTS: { label: string; value: Departement }[] = [
  { label: 'Médecine générale', value: 'MEDECINE' },
  { label: 'Chirurgie', value: 'CHIRURGIE' },
  { label: 'Infirmerie', value: 'INFIRMERIE' },
];

export const CONS_STATUT_CONFIG: Record<
  StatutConsultation,
  { label: string; severity: string; icon: string }
> = {
  PLANIFIEE: { label: 'Planifiée', severity: 'info', icon: 'pi-clock' },
  EN_COURS: { label: 'En cours', severity: 'secondary', icon: 'pi-check' },
  ANNULEE: { label: 'Annulée', severity: 'danger', icon: 'pi-times-circle' },
  TERMINEE: { label: 'Terminée', severity: 'success', icon: 'pi-check-circle' },
};
