package it.solutionsservices.keycloak.provider;

import org.keycloak.component.ComponentModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.RoleModel;
import org.keycloak.storage.StorageId;
import org.keycloak.storage.adapter.AbstractUserAdapterFederatedStorage;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

public class MyUserModel extends AbstractUserAdapterFederatedStorage {

    private final String id;
    private final String email;
    private final String nom;
    private final String prenom;
    private final boolean actif;
    private final String role;
    private final String employeId;

    public MyUserModel(KeycloakSession session, RealmModel realm,
                       ComponentModel storageProviderModel, UserInfo info) {
        super(session, realm, storageProviderModel);
        this.id        = info.getId();
        this.email     = info.getEmail();
        this.nom       = info.getNom();
        this.prenom    = info.getPrenom();
        this.actif     = info.isActif();
        this.role      = info.getRole();
        this.employeId = info.getEmployeId();
    }

    @Override public String getId()        { return StorageId.keycloakId(storageProviderModel, id); }
    @Override public String getUsername()  { return email; }
    @Override public void setUsername(String s) { /* lecture seule */ }
    @Override public String getEmail()     { return email; }
    @Override public String getFirstName() { return prenom; }
    @Override public String getLastName()  { return nom; }
    @Override public boolean isEnabled()   { return actif; }
    @Override public boolean isEmailVerified() { return true; }

    @Override
    protected Set<RoleModel> getRoleMappingsInternal() {
        Set<RoleModel> roles = new HashSet<>();
        if (role != null) {
            RoleModel r = realm.getRole(role);
            if (r != null) roles.add(r);
        }
        return roles;
    }

    private String externalAttribute(String name) {
        return switch (name) {
            case "employeId" -> employeId;
            case "userId"    -> id;
            default          -> null;
        };
    }

    @Override
    public String getFirstAttribute(String name) {
        String v = externalAttribute(name);
        return v != null ? v : super.getFirstAttribute(name);
    }

    @Override
    public Stream<String> getAttributeStream(String name) {
        String v = externalAttribute(name);
        return v != null ? Stream.of(v) : super.getAttributeStream(name);
    }

    @Override
    public Map<String, List<String>> getAttributes() {
        Map<String, List<String>> attrs = new HashMap<>(super.getAttributes());
        if (employeId != null) attrs.put("employeId", List.of(employeId));
        if (id != null)        attrs.put("userId", List.of(id));
        return attrs;
    }
}