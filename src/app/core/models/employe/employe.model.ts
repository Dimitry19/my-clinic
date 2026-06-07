export type TypeContrat = 'CDI' | 'CDD' | 'STAGE' | 'VACATAIRE';
export type StatutEmploye = 'ACTIF' | 'INACTIF' | 'SUSPENDU';
export type Departement =
  | 'MEDECINE'
  | 'CHIRURGIE'
  | 'LABORATOIRE'
  | 'PHARMACIE'
  | 'ADMINISTRATION'
  | 'COMPTABILITE'
  | 'INFIRMERIE'
  | 'URGENCES'
  | 'AUTRES';

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

  createdAt?: string;
}

export interface EmployePage {
  content: Employe[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
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
  { label: 'Autres', value: 'AUTRES' },
];

export const CONTRATS: { label: string; value: TypeContrat }[] = [
  { label: 'CDI', value: 'CDI' },
  { label: 'CDD', value: 'CDD' },
  { label: 'Stage', value: 'STAGE' },
  { label: 'Vacataire', value: 'VACATAIRE' },
];
