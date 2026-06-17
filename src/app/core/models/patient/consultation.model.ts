import { Departement } from '../employe/employe.model';

export type StatutConsultation =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'ANNULEE';
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
  medecinId: string;
  medecinNom: string;
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
  nom: string;
  prenom: string;
  poste: string;
  departement: string;
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
