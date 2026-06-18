import {
  Genre,
  StatutExamenLabo,
  StatutFacture,
  StatutPatient,
} from '../enums/enums.model';

export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: Genre;
  telephone?: string;
  email?: string;
  adresse?: string;
  groupeSanguin?: string;
  allergies?: string;
  antecedents?: string;
  mutuelle?: string;
  numeroMutuelle?: string;
  contactUrgenceNom?: string;
  contactUrgenceTel?: string;
  notesGenerales?: string;
  age: number;
  statut?: StatutPatient;
}

export interface ExamenLabo {
  id: string;
  date: Date;
  type: string;
  statut: StatutExamenLabo;
  resultat?: string;
}
export interface Facture {
  id: string;
  date: Date;
  montant: number;
  paye: number;
  statut: StatutFacture;
}
export interface Ordonnance {
  id: string;
  date: Date;
  medecin: string;
  medicaments: string[];
}
