export enum StatutConge {
  APPROUVE = 'APPROUVE',
  EN_ATTENTE = 'EN_ATTENTE',
  REJETE = 'REJETE',
}

export enum StatutPatient {
  EN_COURS = 'EN_COURS',
  EN_ATTENTE = 'EN_ATTENTE',
  ANNULE = 'ANNULE',
  TERMINE = 'TERMINE',
}

export enum StatutRendezVous {
  PLANIFIE = 'PLANIFIE',
  CONFIRME = 'CONFIRME',
  ANNULE = 'ANNULE',
  TERMINE = 'TERMINE',
  ABSENT = 'ABSENT',
  A_REASSIGNER = 'A_REASSIGNER',
}

export enum StatutExamenLabo {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE',
}

export enum StatutFacture {
  IMPAYEE = 'IMPAYEE',
  PARTIELLEMENT_PAYEE = 'PARTIELLEMENT_PAYEE',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE',
}

export enum StatutEmploye {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
}

export enum Genre {
  M = 'M',
  F = 'F',
  AUTRE = 'AUTRE',
}

export enum Entite {
  EMPLOYE,
  AGENDA,
  CONSULTATION,
  PATIENT,
  LABORATOIRE,
  ORDONNANCE,
  FACTURATION,
  CONGE,
  MEDICAMENT,
}
