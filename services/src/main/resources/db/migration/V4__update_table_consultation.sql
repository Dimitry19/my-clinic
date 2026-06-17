-- ============================================================
-- V2 : Update de la table consultations
-- ============================================================


ALTER TABLE consultations ADD COLUMN type    VARCHAR(20) NOT NULL DEFAULT 'GENERALE'
    CHECK (type IN ('GENERALE','SPECIALISEE','URGENCE','SUIVI','BILAN'));
ALTER TABLE consultations ADD COLUMN statut    VARCHAR(20) NOT NULL DEFAULT 'PLANIFIEE'
    CHECK (statut IN ('PLANIFIEE','EN_COURS','ANNULEE','TERMINEE','ABSENT'));
ALTER TABLE consultations ADD COLUMN duree_minutes  INTEGER NOT NULL DEFAULT 30;









