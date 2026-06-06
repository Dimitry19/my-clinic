package it.solutions.services.trinity.core.security.cfg;

import it.solutions.services.trinity.core.security.filters.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.*;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;


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



    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

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
                    auth.anyRequest().authenticated();
                })
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }



    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider(userDetailsService);
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


}
