package it.solutionsservices.keycloak.provider;


import org.keycloak.component.ComponentModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.storage.UserStorageProviderFactory;


import java.util.List;

public class MyUserStorageProviderFactory
        implements UserStorageProviderFactory<MyUserStorageProvider> {

    public static final String PROVIDER_ID = "my-user-storage";




    @Override
    public String getId() { return PROVIDER_ID; }

    @Override
    public String getHelpText() {
        return "Connexion à la base de données externe";
    }

    @Override
    public MyUserStorageProvider create(KeycloakSession session, ComponentModel model) {
        // Config de la connexion DB — passée depuis l'interface Keycloak
        String jdbcUrl  = model.get("jdbcUrl");
        String dbUser   = model.get("dbUser");
        String dbPass   = model.get("dbPassword");
        return new MyUserStorageProvider(session, model, jdbcUrl, dbUser, dbPass);
    }

    // Champs de configuration affichés dans l'interface Keycloak
    @Override
    public List<ProviderConfigProperty> getConfigProperties() {
        return List.of(
                new ProviderConfigProperty("jdbcUrl",    "JDBC URL",
                        "jdbc:postgresql://localhost:5432/trinity_db",
                        ProviderConfigProperty.STRING_TYPE, null),
                new ProviderConfigProperty("dbUser",     "Utilisateur DB",
                        "trinity_user", ProviderConfigProperty.STRING_TYPE, null),
                new ProviderConfigProperty("dbPassword", "Mot de passe DB",
                        null, ProviderConfigProperty.PASSWORD, null)
        );
    }
}
