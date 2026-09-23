package it.solutionsservices.keycloak.provider;




import org.jboss.logging.Logger;
import org.keycloak.component.ComponentModel;
import org.keycloak.credential.CredentialInput;
import org.keycloak.credential.CredentialInputValidator;
import org.keycloak.models.*;
import org.keycloak.models.credential.PasswordCredentialModel;
import org.keycloak.storage.StorageId;
import org.keycloak.storage.UserStorageProvider;
import org.keycloak.storage.user.UserLookupProvider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.sql.*;
import java.util.UUID;

public class MyUserStorageProvider  implements UserStorageProvider, UserLookupProvider, CredentialInputValidator {

    private static final Logger log = Logger.getLogger(MyUserStorageProvider.class);

    // Requêtes SQL — adapte les noms de colonnes à ta table
    private static final String SQL_BY_EMAIL =
            "SELECT id, nom, prenom, email, role, actif,employe_id " +
                    "FROM v_utilisateur_employe WHERE email = ? and actif=true";

    private static final String SQL_BY_ID = "SELECT id, nom, prenom, email, role, actif,employe_id FROM v_utilisateur_employe WHERE id = ?::uuid";

    private static final String SQL_PASSWORD =  "SELECT mot_de_passe FROM utilisateurs WHERE id = ?::uuid";

        private final KeycloakSession session;
        private final ComponentModel  model;
        private final String          jdbcUrl;
        private final String          dbUser;
        private final String          dbPass;
        private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();



        public MyUserStorageProvider(KeycloakSession session, ComponentModel model,
                                          String jdbcUrl, String dbUser, String dbPass) {
            this.session = session;
            this.model   = model;
            this.jdbcUrl = jdbcUrl;
            this.dbUser  = dbUser;
            this.dbPass  = dbPass;
        }

        // ── Recherche par email ────────────────────────────────
        @Override
        public UserModel getUserByEmail(RealmModel realm, String email) {
            log.infof("Recherche utilisateur par email : %s", email);
            try (Connection conn = getConnection();
                 PreparedStatement ps = conn.prepareStatement(SQL_BY_EMAIL)) {
                ps.setString(1, email.toLowerCase().trim());
                ResultSet rs = ps.executeQuery();
                if (rs.next()) return mapToUser(realm, rs);
            } catch (SQLException e) {
                log.errorf("Erreur SQL getUserByEmail : %s", e.getMessage());
            }
            return null;
        }

        // ── Recherche par ID Keycloak ──────────────────────────
        @Override
        public UserModel getUserById(RealmModel realm, String id) {
            String externalId = StorageId.externalId(id);
            log.infof("Recherche utilisateur par ID : %s", externalId);
            try (Connection conn = getConnection();
                 PreparedStatement ps = conn.prepareStatement(SQL_BY_ID)) {
                ps.setString(1, externalId);
                ResultSet rs = ps.executeQuery();
                if (rs.next()) return mapToUser(realm, rs);
            } catch (SQLException e) {
                log.errorf("Erreur SQL getUserById : %s", e.getMessage());
            }
            return null;
        }

        // ── Recherche par username (= email) ──────
        @Override
        public UserModel getUserByUsername(RealmModel realm, String username) {
            return getUserByEmail(realm, username);
        }

        // ── Validation du mot de passe ─────────────────────────
        @Override
        public boolean supportsCredentialType(String type) {
            return PasswordCredentialModel.TYPE.equals(type);
        }

        @Override
        public boolean isConfiguredFor(RealmModel realm, UserModel user, String type) {
            return supportsCredentialType(type);
        }

        @Override
        public boolean isValid(RealmModel realm, UserModel user, CredentialInput input) {
            if (!supportsCredentialType(input.getType())) return false;

            String externalId = StorageId.externalId(user.getId());
            try (Connection conn = getConnection();
                 PreparedStatement ps = conn.prepareStatement(SQL_PASSWORD)) {
                ps.setObject(1, UUID.fromString(externalId));
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    String hash = rs.getString("mot_de_passe");
                    boolean valid = encoder.matches(input.getChallengeResponse(), hash);
                    log.infof("Validation mot de passe pour %s : %s",
                            user.getEmail(), valid ? "OK" : "ECHEC");
                    return valid;
                }
            } catch (SQLException e) {
                log.errorf("Erreur SQL isValid : %s", e.getMessage());
            }
            return false;
        }

        // ── Mapper ResultSet → UserModel ───────────────────────
        private UserModel mapToUser(RealmModel realm, ResultSet rs) throws SQLException {
            UserInfo info= new UserInfo();
            info.setId(rs.getString("id"));
            info.setEmail(rs.getString("email"));
            info.setNom(rs.getString("nom"));
            info.setPrenom(rs.getString("prenom"));
            info.setRole(rs.getString("role"));
            info.setEmployeId(rs.getString("employe_id"));
            info.setActif(rs.getBoolean("actif"));

            MyUserModel user = new MyUserModel(session, realm, model, info);

            String role = rs.getString("role");
            RoleModel keycloakRole = realm.getRole(role.toLowerCase());
            if (keycloakRole != null) user.grantRole(keycloakRole);
            return user;
        }

        @Override
        public void close() {
            // Pas de pool de connexions ici — chaque connexion est fermée
            // dans le bloc try-with-resources
        }

        // ── Connexion JDBC ─────────────────────────────────────
        private Connection getConnection() throws SQLException {
            try {
                Class.forName("org.postgresql.Driver");
            } catch (ClassNotFoundException e) {
                throw new SQLException("Driver PostgreSQL introuvable", e);
            }
            return DriverManager.getConnection(jdbcUrl, dbUser, dbPass);
        }
    }