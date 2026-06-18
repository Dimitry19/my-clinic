-- ============================================================
-- V2 : Update de la table rendez_vous
-- ============================================================


ALTER TABLE rendez_vous DROP COLUMN statut ;

ALTER TABLE rendez_vous ADD COLUMN statut    VARCHAR(20) NOT NULL DEFAULT 'PLANIFIE'
    CHECK (statut IN ('PLANIFIE','CONFIRME','ANNULE','TERMINE','ABSENT','A_REASSIGNER'))
