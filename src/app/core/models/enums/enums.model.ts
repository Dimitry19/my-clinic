export enum StatutConge {
  APPROUVE = 'APPROUVE',
  EN_ATTENTE = 'EN ATTENTE',
  REJETE = 'REJETE',
}

export enum StatutPatient {
  EN_COURS = 'EN_COURS',
  EN_ATTENTE = 'EN ATTENTE',
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
  EN_ATTENTE = 'EN ATTENTE',
  EN_COURS = 'EN COURS',
  TERMINE = 'TERMINE',
}

export enum StatutFacture {
  IMPAYEE = 'IMPAYEE',
  PARTIELLEMENT_PAYEE = 'PARTIELLEMENT PAYEE',
  PAYEE = 'PAYEE',
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
}
