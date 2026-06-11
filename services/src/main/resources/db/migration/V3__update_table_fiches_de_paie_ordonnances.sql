-- ============================================================
-- V2 : Update de la table ordonnances et fiches_de_paie
-- ============================================================

-- ─── UTILISATEURS (Sécurité / Auth) ───────────────────────
ALTER TABLE fiches_de_paie ADD COLUMN updated_at  TIMESTAMP DEFAULT NOW();

-- ─── ordonnances   ────────────────────────────────────────
ALTER TABLE ordonnances ADD COLUMN updated_at  TIMESTAMP DEFAULT NOW();







