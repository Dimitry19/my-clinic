// ── Ligne médicament ─────────────────────────────────────
export interface MedicamentLigne {
  medicamentNom: string;
  dosage:        string | null;
  frequence:     string | null;
  duree:         string | null;
  instructions:  string | null;
}

// ── Ordonnance ────────────────────────────────────────────
export interface Ordonnance {
  id:             string;
  consultationId: string;
  patientId:      string;
  patientNom:     string;
  medecinId:      string;
  medecinNom:     string;
  dateEmission:   string;
  validiteJours:  number;
  instructions:   string | null;
  pdfPath:        string | null;
  createdAt:      string;
  medicaments:    MedicamentLigne[];
  expiree:        boolean;
}

// ── Request ───────────────────────────────────────────────
export interface OrdonnanceRequest {
  consultationId: string;
  patientId:      string;
  medecinId:      string;
  dateEmission?:  string;
  validiteJours:  number;
  instructions?:  string | null;
  medicaments:    MedicamentLigne[];
}