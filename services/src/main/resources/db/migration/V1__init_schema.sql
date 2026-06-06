-- ============================================================
-- V1 : Schéma initial complet — Gestion Clinique Trinité
-- ============================================================
CREATE SCHEMA IF NOT EXISTS clinic;
-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── UTILISATEURS (Sécurité / Auth) ───────────────────────
CREATE TABLE utilisateurs (
                              id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              email         VARCHAR(150) NOT NULL UNIQUE,
                              mot_de_passe  VARCHAR(255) NOT NULL,
                              nom           VARCHAR(100) NOT NULL,
                              prenom        VARCHAR(100) NOT NULL,
                              role          VARCHAR(30)  NOT NULL CHECK (role IN (
                                                                                  'ADMIN','MEDECIN','INFIRMIER',
                                                                                  'LABORANTIN','COMPTABLE','RECEPTIONNISTE')),
                              actif         BOOLEAN NOT NULL DEFAULT TRUE,
                              created_at    TIMESTAMP DEFAULT NOW(),
                              updated_at    TIMESTAMP DEFAULT NOW()
);

-- ─── PATIENTS ─────────────────────────────────────────────
CREATE TABLE patients (
                          id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          nom                  VARCHAR(100) NOT NULL,
                          prenom               VARCHAR(100) NOT NULL,
                          date_naissance       DATE NOT NULL,
                          sexe                 VARCHAR(10)  NOT NULL CHECK (sexe IN ('M','F','AUTRE')),
                          telephone            VARCHAR(20)  UNIQUE,
                          email                VARCHAR(150),
                          adresse              TEXT,
                          groupe_sanguin       VARCHAR(5),
                          allergies            TEXT,
                          antecedents          TEXT,
                          mutuelle             VARCHAR(100),
                          numero_mutuelle      VARCHAR(50),
                          contact_urgence_nom  VARCHAR(150),
                          contact_urgence_tel  VARCHAR(20),
                          notes_generales      TEXT,
                          created_at           TIMESTAMP DEFAULT NOW(),
                          updated_at           TIMESTAMP DEFAULT NOW()
);

-- ─── EMPLOYÉS (RH) ────────────────────────────────────────
CREATE TABLE employes (
                          id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          utilisateur_id    UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
                          nom               VARCHAR(100) NOT NULL,
                          prenom            VARCHAR(100) NOT NULL,
                          poste             VARCHAR(100) NOT NULL,
                          departement       VARCHAR(100),
                          telephone         VARCHAR(20),
                          email             VARCHAR(150),
                          date_embauche     DATE NOT NULL,
                          salaire_base      NUMERIC(12,2) NOT NULL DEFAULT 0,
                          type_contrat      VARCHAR(20) CHECK (type_contrat IN ('CDI','CDD','STAGE','VACATAIRE')),
                          numero_cnss       VARCHAR(50),
                          rib               VARCHAR(50),
                          actif             BOOLEAN NOT NULL DEFAULT TRUE,
                          created_at        TIMESTAMP DEFAULT NOW(),
                          updated_at        TIMESTAMP DEFAULT NOW()
);

-- ─── CONGÉS ───────────────────────────────────────────────
CREATE TABLE conges (
                        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        employe_id      UUID NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
                        type_conge      VARCHAR(50) NOT NULL,
                        date_debut      DATE NOT NULL,
                        date_fin        DATE NOT NULL,
                        motif           TEXT,
                        statut          VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
                            CHECK (statut IN ('EN_ATTENTE','APPROUVE','REJETE')),
                        approuve_par    UUID REFERENCES utilisateurs(id),
                        created_at      TIMESTAMP DEFAULT NOW(),
                        updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── FICHES DE PAIE ───────────────────────────────────────
CREATE TABLE fiches_de_paie (
                                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                employe_id      UUID NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
                                mois            INTEGER NOT NULL CHECK (mois BETWEEN 1 AND 12),
                                annee           INTEGER NOT NULL,
                                salaire_brut    NUMERIC(12,2) NOT NULL,
                                cotisations     NUMERIC(12,2) NOT NULL DEFAULT 0,
                                primes          NUMERIC(12,2) NOT NULL DEFAULT 0,
                                retenues        NUMERIC(12,2) NOT NULL DEFAULT 0,
                                salaire_net     NUMERIC(12,2) NOT NULL,
                                pdf_path        VARCHAR(500),
                                created_at      TIMESTAMP DEFAULT NOW(),
                                UNIQUE (employe_id, mois, annee)
);

-- ─── RENDEZ-VOUS ──────────────────────────────────────────
CREATE TABLE rendez_vous (
                             id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                             medecin_id      UUID NOT NULL REFERENCES utilisateurs(id),
                             date_heure      TIMESTAMP NOT NULL,
                             duree_minutes   INTEGER NOT NULL DEFAULT 30,
                             motif           TEXT,
                             statut          VARCHAR(20) NOT NULL DEFAULT 'PLANIFIE'
                                 CHECK (statut IN ('PLANIFIE','CONFIRME','ANNULE','TERMINE','ABSENT')),
                             notes           TEXT,
                             rappel_envoye   BOOLEAN DEFAULT FALSE,
                             created_at      TIMESTAMP DEFAULT NOW(),
                             updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── CONSULTATIONS ────────────────────────────────────────
CREATE TABLE consultations (
                               id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                               medecin_id      UUID NOT NULL REFERENCES utilisateurs(id),
                               rendez_vous_id  UUID REFERENCES rendez_vous(id),
                               date_heure      TIMESTAMP NOT NULL DEFAULT NOW(),
                               motif           TEXT,
                               symptomes       TEXT,
                               diagnostic      TEXT,
                               traitement      TEXT,
                               tension         VARCHAR(20),
                               temperature     NUMERIC(4,1),
                               poids           NUMERIC(5,2),
                               taille          NUMERIC(5,2),
                               notes           TEXT,
                               created_at      TIMESTAMP DEFAULT NOW(),
                               updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── ORDONNANCES ──────────────────────────────────────────
CREATE TABLE ordonnances (
                             id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             consultation_id  UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
                             patient_id       UUID NOT NULL REFERENCES patients(id),
                             medecin_id       UUID NOT NULL REFERENCES utilisateurs(id),
                             date_emission    TIMESTAMP NOT NULL DEFAULT NOW(),
                             validite_jours   INTEGER DEFAULT 30,
                             instructions     TEXT,
                             pdf_path         VARCHAR(500),
                             created_at       TIMESTAMP DEFAULT NOW()
);

-- ─── LIGNES D'ORDONNANCE ──────────────────────────────────
CREATE TABLE ordonnance_medicaments (
                                        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        ordonnance_id   UUID NOT NULL REFERENCES ordonnances(id) ON DELETE CASCADE,
                                        medicament_nom  VARCHAR(200) NOT NULL,
                                        dosage          VARCHAR(100),
                                        frequence       VARCHAR(100),
                                        duree           VARCHAR(100),
                                        instructions    TEXT
);

-- ─── MÉDICAMENTS / STOCK ──────────────────────────────────
CREATE TABLE medicaments (
                             id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             nom                 VARCHAR(200) NOT NULL,
                             denomination        VARCHAR(200),
                             forme               VARCHAR(50),
                             dosage_unitaire     VARCHAR(50),
                             stock_actuel        INTEGER NOT NULL DEFAULT 0,
                             stock_minimum       INTEGER NOT NULL DEFAULT 10,
                             prix_unitaire       NUMERIC(10,2),
                             fournisseur         VARCHAR(150),
                             date_expiration     DATE,
                             actif               BOOLEAN DEFAULT TRUE,
                             created_at          TIMESTAMP DEFAULT NOW(),
                             updated_at          TIMESTAMP DEFAULT NOW()
);

-- ─── EXAMENS LABORATOIRE ──────────────────────────────────
CREATE TABLE examens_labo (
                              id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              consultation_id  UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
                              patient_id       UUID NOT NULL REFERENCES patients(id),
                              prescrit_par     UUID NOT NULL REFERENCES utilisateurs(id),
                              type_examen      VARCHAR(150) NOT NULL,
                              description      TEXT,
                              statut           VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'
                                  CHECK (statut IN ('EN_ATTENTE','EN_COURS','TERMINE','ANNULE')),
                              date_prescription TIMESTAMP DEFAULT NOW(),
                              date_resultat    TIMESTAMP,
                              created_at       TIMESTAMP DEFAULT NOW(),
                              updated_at       TIMESTAMP DEFAULT NOW()
);

-- ─── RÉSULTATS LABORATOIRE ────────────────────────────────
CREATE TABLE resultats_labo (
                                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                examen_id       UUID NOT NULL REFERENCES examens_labo(id) ON DELETE CASCADE,
                                laborantin_id   UUID NOT NULL REFERENCES utilisateurs(id),
                                parametres      JSONB,
                                interpretation  TEXT,
                                pdf_path        VARCHAR(500),
                                created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── FACTURES ─────────────────────────────────────────────
CREATE TABLE factures (
                          id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          patient_id       UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                          consultation_id  UUID REFERENCES consultations(id),
                          numero_facture   VARCHAR(50) NOT NULL UNIQUE,
                          date_emission    TIMESTAMP NOT NULL DEFAULT NOW(),
                          montant_total    NUMERIC(12,2) NOT NULL DEFAULT 0,
                          montant_paye     NUMERIC(12,2) NOT NULL DEFAULT 0,
                          statut           VARCHAR(20) NOT NULL DEFAULT 'IMPAYEE'
                              CHECK (statut IN ('IMPAYEE','PARTIELLEMENT_PAYEE','PAYEE','ANNULEE')),
                          notes            TEXT,
                          pdf_path         VARCHAR(500),
                          created_at       TIMESTAMP DEFAULT NOW(),
                          updated_at       TIMESTAMP DEFAULT NOW()
);

-- ─── LIGNES DE FACTURE ────────────────────────────────────
CREATE TABLE facture_lignes (
                                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                facture_id      UUID NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
                                description     VARCHAR(300) NOT NULL,
                                quantite        INTEGER NOT NULL DEFAULT 1,
                                prix_unitaire   NUMERIC(10,2) NOT NULL,
                                total           NUMERIC(10,2) NOT NULL
);

-- ─── PAIEMENTS ────────────────────────────────────────────
CREATE TABLE paiements (
                           id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           facture_id      UUID NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
                           montant         NUMERIC(12,2) NOT NULL,
                           mode_paiement   VARCHAR(30) NOT NULL CHECK (mode_paiement IN
                                                                       ('ESPECES','CARTE','VIREMENT','MOBILE_MONEY','MUTUELLE','AUTRE')),
                           reference       VARCHAR(100),
                           date_paiement   TIMESTAMP NOT NULL DEFAULT NOW(),
                           encaisse_par    UUID REFERENCES utilisateurs(id),
                           created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── INDEX ────────────────────────────────────────────────
CREATE INDEX idx_patients_nom     ON patients(nom, prenom);
CREATE INDEX idx_patients_tel     ON patients(telephone);
CREATE INDEX idx_rdv_medecin_date ON rendez_vous(medecin_id, date_heure);
CREATE INDEX idx_rdv_patient      ON rendez_vous(patient_id);
CREATE INDEX idx_consult_patient  ON consultations(patient_id);
CREATE INDEX idx_consult_medecin  ON consultations(medecin_id);
CREATE INDEX idx_factures_patient ON factures(patient_id);
CREATE INDEX idx_factures_statut  ON factures(statut);
CREATE INDEX idx_examens_patient  ON examens_labo(patient_id);
CREATE INDEX idx_stock_medicament ON medicaments(stock_actuel);

-- ─── ADMIN PAR DÉFAUT ─────────────────────────────────────
-- Mot de passe : Admin@1234 (BCrypt)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES
    ('Admin', 'Système', 'admin@clinique.com',
     '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- Admin@1234
     'ADMIN');