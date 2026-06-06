export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: 'M' | 'F' | 'AUTRE';
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
  statut?: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
}

export interface RendezVous {
  id: string;
  patientNom: string;
  patientPrenom: string;
  medecinNom: string;
  dateHeure: Date;
  dureeMinutes: number;
  motif: string;
  statut: 'PLANIFIE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'ABSENT';
}

export interface StatDashboard {
  patientsAujourdhui: number;
  enAttente: number;
  rdvRestants: number;
  consultationsTerminees: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
