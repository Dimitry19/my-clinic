package it.solutions.services.trinity.core.security.cfg;

import it.solutions.services.trinity.core.shared.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.*;
import java.util.stream.Collectors;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${permit.swagger.paths}")
    private List<String> permitSwaggerPaths;

    @Value("${permit.static.resources.paths}")
    private List<String> permitStaticResourcesPaths;
    @Value("${permit.public.endpoint}")
    private List<String> permitPublicEndpoints;


    private static final Set<String> ROLE_NAMES =
            Arrays.stream(Role.values()).map(Enum::name).collect(Collectors.toSet());



    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Filtre les patterns vides ou sans slash initial
        String[] swaggerPaths = permitSwaggerPaths.stream()
                .map(String::trim)
                .filter(p -> !p.isBlank() && p.startsWith("/"))
                .toArray(String[]::new);

        String[] staticPaths = permitStaticResourcesPaths.stream()
                .map(String::trim)
                .filter(p -> !p.isBlank() && p.startsWith("/"))
                .toArray(String[]::new);

        String[] publicPaths = permitPublicEndpoints.stream()
                .map(String::trim)
                .filter(p -> !p.isBlank() && p.startsWith("/"))
                .toArray(String[]::new);

        return http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> {
                    if (swaggerPaths.length > 0)
                        auth.requestMatchers(swaggerPaths).permitAll();
                    if (staticPaths.length > 0)
                        auth.requestMatchers(staticPaths).permitAll();
                    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                    if (publicPaths.length > 0)
                        auth.requestMatchers(publicPaths).permitAll();
                    auth.requestMatchers("/actuator/health/**").permitAll();
                    auth.anyRequest().authenticated();
                })
                .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(jwtConverter())))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }



    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }



    @Bean
    public JwtAuthenticationConverter jwtConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this::extractRoles);
        return converter;
    }

    @SuppressWarnings("unchecked")
    private Collection<GrantedAuthority> extractRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null || realmAccess.get("roles") == null) return List.of();

        return ((Collection<String>) realmAccess.get("roles")).stream()
                .filter(ROLE_NAMES::contains)
                .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r))
                .toList();
    }


}
