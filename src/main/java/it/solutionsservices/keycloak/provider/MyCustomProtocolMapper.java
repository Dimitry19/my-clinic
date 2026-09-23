package it.solutionsservices.keycloak.provider;

import org.jboss.logging.Logger;
import org.keycloak.models.ClientSessionContext;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.ProtocolMapperModel;
import org.keycloak.models.UserModel;
import org.keycloak.models.UserSessionModel;
import org.keycloak.protocol.oidc.mappers.AbstractOIDCProtocolMapper;
import org.keycloak.protocol.oidc.mappers.OIDCAccessTokenMapper;
import org.keycloak.protocol.oidc.mappers.OIDCAttributeMapperHelper;
import org.keycloak.protocol.oidc.mappers.OIDCIDTokenMapper;
import org.keycloak.protocol.oidc.mappers.UserInfoTokenMapper;
import org.keycloak.provider.ProviderConfigProperty;
import org.keycloak.representations.IDToken;

import java.util.ArrayList;
import java.util.List;

public class MyCustomProtocolMapper extends AbstractOIDCProtocolMapper
        implements OIDCAccessTokenMapper, OIDCIDTokenMapper, UserInfoTokenMapper {

    private static final Logger logger = Logger.getLogger(MyCustomProtocolMapper.class);

    public static final String USER_ATTRIBUTE = "user.attribute";
    public static final String PROVIDER_ID = "my-custom-protocol-mapper";

    private static final List<ProviderConfigProperty> configProperties = new ArrayList<>();

    static {
        ProviderConfigProperty userAttribute = new ProviderConfigProperty();
        userAttribute.setName(USER_ATTRIBUTE);
        userAttribute.setLabel("User Attribute");
        userAttribute.setType(ProviderConfigProperty.STRING_TYPE);
        userAttribute.setHelpText("Nom de l'attribut utilisateur à copier dans le token");
        configProperties.add(userAttribute);

        OIDCAttributeMapperHelper.addTokenClaimNameConfig(configProperties);
        OIDCAttributeMapperHelper.addJsonTypeConfig(configProperties);
        OIDCAttributeMapperHelper.addIncludeInTokensConfig(configProperties, MyCustomProtocolMapper.class);
    }

    @Override public String getDisplayCategory() { return "Token mapper"; }
    @Override public String getDisplayType()     { return "Trinity attribute mapper"; }
    @Override public String getHelpText()        { return "Copie un attribut utilisateur dans un claim"; }
    @Override public List<ProviderConfigProperty> getConfigProperties() { return configProperties; }
    @Override public String getId()              { return PROVIDER_ID; }

    @Override
    protected void setClaim(IDToken token, ProtocolMapperModel mappingModel,
                            UserSessionModel userSession, KeycloakSession session,
                            ClientSessionContext clientSessionCtx) {
        UserModel user = userSession.getUser();
        String attributeName = mappingModel.getConfig().get(USER_ATTRIBUTE);
        if (attributeName == null || attributeName.isBlank()) return;

        String value = user.getFirstAttribute(attributeName);
        if (value == null) {
            logger.debugf("Attribut '%s' absent pour l'utilisateur %s", attributeName, user.getId());
            return;
        }
        // ne jamais logger la valeur : données médicales/personnelles
        OIDCAttributeMapperHelper.mapClaim(token, mappingModel, value);
    }
}