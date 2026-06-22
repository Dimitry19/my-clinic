// ── Paramètre individuel d'un résultat ───────────────────
export interface ParametreResultat {
  libelle: string; // Ex: "Hémoglobine"
  valeur: string; // Ex: "12.5"
  unite: string; // Ex: "g/dL"
  norme: string; // Ex: "12-16"
  anormal: boolean; // true si hors norme
}

// ── Résultat complet d'un examen ─────────────────────────
export interface ResultatLabo {
  id: string;
  examenId: string;
  laborantinId: string;
  laborantinNom: string;
  parametres: ParametreResultat[];
  interpretation: string | null;
  pdfPath: string | null;
  createdAt: string;
}

// ── Request création/modification ─────────────────────────
export interface ResultatLaboRequest {
  examenId: string;
  laborantinId: string;
  parametres: ParametreResultat[];
  interpretation: string | null;
}

// ── ExamenLabo enrichi avec son résultat ──────────────────
// À fusionner avec votre interface ExamenLabo existante
export interface ExamenLaboWithResultat {
  id: string;
  consultationId: string;
  patientId: string;
  patientNom: string;
  prescritParId: string;
  prescritParNom: string;
  typeExamen: string;
  description: string;
  statut: string;
  datePrescription: string;
  dateResultat: string | null;
  createdAt: string;
  updatedAt: string;
  resultat?: ResultatLabo | null; // ← champ ajouté
}
