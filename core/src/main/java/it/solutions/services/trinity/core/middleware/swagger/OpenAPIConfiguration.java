package it.solutions.services.trinity.core.middleware.swagger;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.SpecVersion;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

import static org.springframework.security.config.Elements.JWT;


@Configuration
public class OpenAPIConfiguration {


    @Value("${application.version}")
    private String version;

    @Value("${spring.application.name}")
    private String title;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(title)
                        .description(title)
                        //.version(apiInfoVersion)
                        .license(new License().name(title))
                        .contact(new Contact()
                                .name(title)
                                .url(title)
                                .email(title)))
                .addSecurityItem(new SecurityRequirement().addList(JWT))
                .components(new Components()
                        .addSecuritySchemes(JWT, new SecurityScheme()
                                .name(title)
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .description("JWT Authentication cookie (HttpOnly)")));
    }
}