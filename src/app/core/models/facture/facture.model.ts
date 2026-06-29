// ── Statuts & Modes ───────────────────────────────────────

import { StatutFacture } from '../enums/enums.model';

export type ModePaiement =
  | 'ESPECES'
  | 'CARTE'
  | 'VIREMENT'
  | 'MOBILE_MONEY'
  | 'MUTUELLE'
  | 'AUTRE';

// ── Config statut ─────────────────────────────────────────
export const FACTURE_STATUT_CONFIG: Record<
  StatutFacture,
  {
    label: string;
    severity: 'success' | 'info' | 'secondary' | 'danger' | 'primary';
    icon: string;
  }
> = {
  IMPAYEE: { label: 'Impayée', severity: 'danger', icon: 'pi-times-circle' },
  PARTIELLEMENT_PAYEE: {
    label: 'Partiellement payée',
    severity: 'info',
    icon: 'pi-clock',
  },
  PAYEE: { label: 'Payée', severity: 'success', icon: 'pi-check-circle' },
  ANNULEE: { label: 'Annulée', severity: 'secondary', icon: 'pi-ban' },
};

// ── Config mode de paiement ───────────────────────────────
export const MODE_PAIEMENT_CONFIG: Record<
  ModePaiement,
  { label: string; icon: string }
> = {
  ESPECES: { label: 'Espèces', icon: 'pi-money-bill' },
  CARTE: { label: 'Carte', icon: 'pi-credit-card' },
  VIREMENT: { label: 'Virement', icon: 'pi-building' },
  MOBILE_MONEY: { label: 'Mobile Money', icon: 'pi-mobile' },
  MUTUELLE: { label: 'Mutuelle', icon: 'pi-shield' },
  AUTRE: { label: 'Autre', icon: 'pi-ellipsis-h' },
};

// ── Ligne de facture ──────────────────────────────────────
export interface FactureLigne {
  id?: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

// ── Paiement ──────────────────────────────────────────────
export interface Paiement {
  id: string;
  factureId: string;
  montant: number;
  modePaiement: ModePaiement;
  reference: string | null;
  datePaiement: string;
  encaisseParId: string | null;
  encaisseParNom: string | null;
  createdAt: string;
}

// ── Facture ───────────────────────────────────────────────
export interface Facture {
  id: string;
  patientId: string;
  patientNom: string;
  consultationId: string | null;
  numeroFacture: string;
  dateEmission: string;
  montantTotal: number;
  montantPaye: number;
  resteAPayer: number;
  statut: StatutFacture;
  notes: string | null;
  pdfPath: string | null;
  createdAt: string;
  updatedAt: string;
  lignes: FactureLigne[];
  paiements: Paiement[];
}

// ── Requests ──────────────────────────────────────────────
export interface FactureRequest {
  patientId: string;
  consultationId?: string | null;
  dateEmission?: string;
  notes?: string | null;
  lignes: LigneRequest[];
}

export interface LigneRequest {
  description: string;
  quantite: number;
  prixUnitaire: number;
}

export interface PaiementRequest {
  factureId: string;
  montant: number;
  modePaiement: ModePaiement;
  reference?: string | null;
  datePaiement?: string;
  encaisseParId?: string | null;
}
