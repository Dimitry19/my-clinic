-- ============================================================
-- V2 : Update de la table utilisateurs et employes
-- ============================================================

-- ─── UTILISATEURS (Sécurité / Auth) ───────────────────────
ALTER TABLE utilisateurs DROP CONSTRAINT IF EXISTS utilisateurs_role_check;
ALTER TABLE utilisateurs ADD CONSTRAINT employes_type_contrat_check
    CHECK (role IN ('SUPER_ADMIN','ADMIN', 'MEDECIN', 'INFIRMIER', 'LABORANTIN', 'COMPTABLE','PHARMACIEN','URGENTISTE','RECEPTIONNISTE'));
-- ─── EMPLOYÉS (RH) ────────────────────────────────────────

ALTER TABLE employes DROP CONSTRAINT IF EXISTS employes_type_contrat_check;
ALTER TABLE employes ADD CONSTRAINT employes_type_contrat_check
    CHECK (type_contrat IN ('CDI', 'CDD', 'STAGE', 'VACATAIRE', 'EXTERNE'));






