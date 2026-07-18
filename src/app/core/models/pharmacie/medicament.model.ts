export type StatutStock = 'DISPONIBLE' | 'ALERTE' | 'RUPTURE';
export type FormePharmaceutique =
  | 'COMPRIMES'
  | 'GELULES'
  | 'SIROP'
  | 'INJECTABLE'
  | 'POMMADE'
  | 'GOUTTES'
  | 'SACHET'
  | 'AUTRE';
export type MotifMouvement =
  | 'RECEPTION'
  | 'DISPENSATION'
  | 'RETOUR'
  | 'AJUSTEMENT'
  | 'PEREMPTION';

export interface Medicament {
  id: string;
  nom: string;
  denomination?: string;
  forme?: string;
  dosageUnitaire?: string;
  stockActuel: number;
  stockMinimum: number;
  prixUnitaire?: number;
  fournisseur?: string;
  dateExpiration?: string;
  actif: boolean;
  statutStock: StatutStock;
  expire: boolean;
  expireBientot: boolean;
  manquant: number;
}

export interface MouvementRequest {
  medicamentId: string;
  quantite: number;
  motif: MotifMouvement;
  reference?: string;
}

export interface StockStats {
  totalMedicaments: number;
  disponibles: number;
  alertes: number;
  ruptures: number;
  expires: number;
  expireBientot: number;
}

export const FORMES = [
  { label: 'Comprimés', value: 'COMPRIMES' },
  { label: 'Gélules', value: 'GELULES' },
  { label: 'Sirop', value: 'SIROP' },
  { label: 'Injectable', value: 'INJECTABLE' },
  { label: 'Pommade', value: 'POMMADE' },
  { label: 'Gouttes', value: 'GOUTTES' },
  { label: 'Sachet', value: 'SACHET' },
  { label: 'Autre', value: 'AUTRE' },
];

export const MOTIFS_MOUVEMENT = [
  { label: 'Réception fournisseur', value: 'RECEPTION' },
  { label: 'Dispensation patient', value: 'DISPENSATION' },
  { label: 'Retour', value: 'RETOUR' },
  { label: 'Ajustement inventaire', value: 'AJUSTEMENT' },
  { label: 'Péremption', value: 'PEREMPTION' },
];
