import { StatutConge, StatutEmploye } from '../enums/enums.model';

export type TypeContrat = 'CDI' | 'CDD' | 'STAGE' | 'VACATAIRE' | 'EXTERNE';

export type RoleEmploye =
  | 'MEDECIN'
  | 'INFIRMIER'
  | 'ADMIN'
  | 'COMPTABLE'
  | 'PHARMACIEN'
  | 'LABORANTIN'
  | 'RECEPTIONNISTE'
  | 'URGENTISTE';

export type Departement =
  | 'MEDECINE'
  | 'CHIRURGIE'
  | 'LABORATOIRE'
  | 'PHARMACIE'
  | 'ADMINISTRATION'
  | 'COMPTABILITE'
  | 'INFIRMERIE'
  | 'URGENCES';

export interface Employe {
  id: string;
  utilisateurId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  poste: string;
  departement: Departement;
  typeContrat: TypeContrat;
  dateEmbauche: string;
  salaireBase: number;
  numeroCnss?: string;
  rib?: string;
  adresse?: string;
  statut: StatutEmploye;
  role: RoleEmploye;
  createdAt?: string;
}

export const DEPARTEMENTS: { label: string; value: Departement }[] = [
  { label: 'Médecine générale', value: 'MEDECINE' },
  { label: 'Chirurgie', value: 'CHIRURGIE' },
  { label: 'Laboratoire', value: 'LABORATOIRE' },
  { label: 'Pharmacie', value: 'PHARMACIE' },
  { label: 'Administration', value: 'ADMINISTRATION' },
  { label: 'Comptabilité', value: 'COMPTABILITE' },
  { label: 'Infirmerie', value: 'INFIRMERIE' },
  { label: 'Urgences', value: 'URGENCES' },
];

export const CONTRATS: { label: string; value: TypeContrat }[] = [
  { label: 'CDI', value: 'CDI' },
  { label: 'CDD', value: 'CDD' },
  { label: 'Stage', value: 'STAGE' },
  { label: 'Vacataire', value: 'VACATAIRE' },
  { label: 'Externe', value: 'EXTERNE' },
];
export const ROLES: { label: string; value: RoleEmploye }[] = [
  { label: 'Médecin', value: 'MEDECIN' },
  { label: 'Infirmier', value: 'INFIRMIER' },
  { label: 'Administratif', value: 'ADMIN' },
  { label: 'Comptable', value: 'COMPTABLE' },
  { label: 'Pharmacien', value: 'PHARMACIEN' },
  { label: 'Laborantin', value: 'LABORANTIN' },
  { label: 'Réceptionniste', value: 'RECEPTIONNISTE' },
  { label: 'Urgentiste', value: 'URGENTISTE' },
];

export interface FicheDePaie {
  id: string;
  mois: number;
  annee: number;
  salaireBrut: number;
  cotisations: number;
  primes: number;
  retenues: number;
  salaireNet: number;
  pdfPath?: string;
}

export interface Conge {
  id: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutConge;
  motif?: string;
  dureeJours: number;
}

export interface TimelineEvent {
  date: Date;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  type: string;
}
