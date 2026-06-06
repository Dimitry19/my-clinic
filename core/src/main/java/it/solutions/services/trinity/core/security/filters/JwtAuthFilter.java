package it.solutions.services.trinity.core.security.filters;

import it.solutions.services.trinity.core.security.services.CookieUtils;
import it.solutions.services.trinity.core.security.services.JwtService;
import it.solutions.services.trinity.core.security.services.MyUserDetailsService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collection;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Value("${auth.access.token.cookie.name}")
    protected String accessTokenCookieName;

    @Value("${auth.refresh.token.cookie.name}")
    protected String refreshTokenCookieName;

    @Value("${app.jwt.access.expiration}")
    private long expiration;
    @Value("${app.jwt.refresh.expiration}")
    private long refreshExpiration;

    private final JwtService jwtService;
    private final CookieUtils cookieUtils;
    private final MyUserDetailsService userDetailsService;


    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        try {
            setAuthentication(req);
        } catch (Exception e) {
            if (tryTransparentRefresh(req, res)) {
                chain.doFilter(req, res);
                return;
            }
            expireCookies(res);
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(req, res);
    }

    private boolean tryTransparentRefresh(HttpServletRequest request,
                                          HttpServletResponse response ) {
        try {



            String refreshToken = cookieUtils.extractFromCookie(request, refreshTokenCookieName);
            if (StringUtils.isEmpty(refreshToken)) {
                return false;
            }
            String email = jwtService.extraireEmail(refreshToken);

            if (StringUtils.isEmpty(email)) {
                return false;
            }
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            if (!jwtService.isValid(refreshToken, userDetails)) {
                return false;
            }

            // Générer un nouveau access  et refresh token
            String newAccessToken = jwtService.genererToken(userDetails, false );
            String newRefreshToken = jwtService.genererToken(userDetails,  true);


            // Écrire les nouveaux cookies dans la réponse de la requête courante
            // Le frontend les reçoit automatiquement avec la réponse de son appel original
            response.addHeader(HttpHeaders.SET_COOKIE,
                    cookieUtils.createAccessTokenCookie(newAccessToken,
                            expiration).toString());
            response.addHeader(HttpHeaders.SET_COOKIE,
                    cookieUtils.createRefreshTokenCookie(newRefreshToken,
                            refreshExpiration).toString());

            // Peupler le SecurityContext avec le nouveau token
            SecurityContextHolder.clearContext();
            setSecurityContextAuthentication(userDetails,request);
            log.info("Refresh transparent réussi pour l'utilisateur : {}", email);
            return true;

        } catch (Exception e) {
            log.error("Échec du refresh transparent : {}", e.getMessage());
            return false;

        }
    }

    private void expireCookies(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieUtils.deleteAccessTokenCookie().toString());
        response.addHeader(HttpHeaders.SET_COOKIE,
                cookieUtils.deleteRefreshTokenCookie().toString());
    }

    private void setAuthentication(HttpServletRequest request) {

        String accessToken =
                cookieUtils.mixedExtractFromRequest(request, accessTokenCookieName);

        UserDetails userDetails =
                jwtService.extractUserDetails(accessToken);

        if (userDetails== null) {
            throw new AccessDeniedException("Token manquant");
        }
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return;
        }


        if (!jwtService.isValid(accessToken, userDetails)) {
            throw new BadCredentialsException("Token invalide");
        }

        setSecurityContextAuthentication(userDetails,request);
    }


    private void setSecurityContextAuthentication( UserDetails userDetails, HttpServletRequest request){
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

        authentication.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}