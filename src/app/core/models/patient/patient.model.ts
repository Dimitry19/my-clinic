import { Genre, StatutPatient } from '../enums/enums.model';

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
