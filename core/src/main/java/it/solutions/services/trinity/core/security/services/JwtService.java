package it.solutions.services.trinity.core.security.services;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import it.solutions.services.trinity.core.shared.entities.User;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.*;

import static it.solutions.services.trinity.core.security.JwtUtils.*;

@Service
public class JwtService {


    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access.expiration}")
    private long expiration;
    @Value("${app.jwt.refresh.expiration}")
    private long refreshExpiration;

    private final MyUserDetailsService userDetailsService;
    private final CookieUtils cookieUtils;

    public JwtService(MyUserDetailsService userDetailsService, CookieUtils cookieUtils) {
        this.userDetailsService = userDetailsService;
        this.cookieUtils = cookieUtils;
    }

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String genererToken(UserDetails userDetails, boolean refresh) {
        Map<String, Object> claims = new HashMap<>();
        if (userDetails instanceof User u) {
            claims.put(CLAIMS_ROLE, u.getRole().name());
            claims.put(CLAIMS_AUTHENTICATED, true);
            claims.put(CLAIMS_EMAIL, u.getEmail());
        }
        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + (refresh? refreshExpiration: expiration)))
                .signWith(getKey())
                .compact();
    }

    public UserDetails extractUserDetails(String token) {

        if(StringUtils.isEmpty(token)) return null;
        Claims claims = parseClaims(token);

        String email = claims.get(CLAIMS_EMAIL, String.class);
        String role = claims.get(CLAIMS_ROLE, String.class);

        Collection<GrantedAuthority> authorities =
                Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role)
                );

        return org.springframework.security.core.userdetails.User
                .withUsername(email)
                .password("")
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }

    public String extraireEmail(String token) {
        if(StringUtils.isEmpty(token)) return null;
        return Jwts.parser().verifyWith(getKey()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isValid(String token, UserDetails userDetails) {
        try {
            if(StringUtils.isEmpty(token) || userDetails==null) return false;
            String email = extraireEmail(token);
            Date expiry = Jwts.parser().verifyWith(getKey()).build()
                    .parseSignedClaims(token).getPayload().getExpiration();
            return email.equals(userDetails.getUsername()) && expiry.after(new Date()) && validateClaims(token,  userDetails);
        } catch (JwtException e) {
            return false;
        }
    }

    public void createNewTokens(String email, String accessToken, String refreshToken,   HttpHeaders responseHeaders) {
        UserDetails user = userDetailsService.loadUserByUsername(email);
        boolean accessTokenValid=isValid(accessToken,user);
        boolean refreshTokenValid =isValid(refreshToken,user);

        internalCreateNewTokens(user,accessTokenValid,refreshTokenValid,responseHeaders);
    }

    private void internalCreateNewTokens(UserDetails  user, boolean accessTokenValid, boolean refreshTokenValid, HttpHeaders responseHeaders) {

        boolean creatoBothTokens = (!accessTokenValid && !refreshTokenValid) || (accessTokenValid && refreshTokenValid);
        String newAccessToken ;
        if(creatoBothTokens) {
            newAccessToken = genererToken(user, false);
            String newRefreshToken =genererToken(user, true);
            cookieUtils.addAccessTokenCookie(responseHeaders, newAccessToken);
            cookieUtils.addRefreshTokenCookie(responseHeaders, newRefreshToken);
        }

        if(!accessTokenValid && refreshTokenValid) {
            newAccessToken = genererToken(user, false);
            cookieUtils.addAccessTokenCookie(responseHeaders, newAccessToken);
        }

    }


    private boolean validateClaims(String authToken, UserDetails userDetails) {
        if((StringUtils.isNotEmpty(authToken))){
            Claims claims = parseClaims(authToken);
            User u= userDetailsService.findByEmail(userDetails.getUsername());
            boolean isAuthenticated=claims.get(CLAIMS_AUTHENTICATED).equals(Boolean.TRUE);
            boolean isRole=claims.get(CLAIMS_ROLE).equals(u.getRole().name());
            boolean isUser=claims.get(CLAIMS_EMAIL).equals(u.getEmail());
            return  isAuthenticated && isRole && isUser;
        }
        return false;
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

    }
}
