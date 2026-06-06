package it.solutions.services.trinity.core.security.services;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class CookieUtils {

    private static final Logger log = LoggerFactory.getLogger(CookieUtils.class);

    @Value("${auth.access.token.cookie.name}")
    private String accessTokenCookieName;

    @Value("${auth.refresh.token.cookie.name}")
    private String refreshTokenCookieName;


    private final boolean secure;
    private final String sameSite;

    @Value("${app.jwt.access.expiration}")
    private long expiration;
    @Value("${app.jwt.refresh.expiration}")
    private long refreshExpiration;



    public CookieUtils(){
        this.secure = false;
        this.sameSite = "Lax";
    }

    public HttpCookie createAccessTokenCookie(String encryptedToken, Long duration) {
        return ResponseCookie.from(accessTokenCookieName, encryptedToken)
                .maxAge(duration)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite(sameSite)
                .build();
    }

    public HttpCookie createRefreshTokenCookie(String encryptedToken, Long duration) {

        return ResponseCookie.from(refreshTokenCookieName, encryptedToken)
                .maxAge(duration)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite(sameSite)
                .build();
    }

    public String mixedExtractFromRequest(HttpServletRequest request, String name) {

        return extractFromCookie(request,name);
    }

    public String extractFromCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }


    public HttpCookie deleteAccessTokenCookie() {
        return expireCookie(accessTokenCookieName);
    }

    public HttpCookie deleteRefreshTokenCookie() {
        return expireCookie(refreshTokenCookieName);
    }

    public void addAccessTokenCookie(HttpHeaders httpHeaders, String token) {
        httpHeaders.add(HttpHeaders.SET_COOKIE, createAccessTokenCookie(token,  expiration).toString());
    }
    public void addRefreshTokenCookie(HttpHeaders httpHeaders, String token) {
        httpHeaders.add(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(token, refreshExpiration).toString());
    }

    public String extractAccessTokenFromHeaders(HttpHeaders responseHeaders, String name) {
        List<String> cookies = responseHeaders.get(HttpHeaders.SET_COOKIE);
        if (cookies == null) return null;

        String prefix = name + "=";
        return cookies.stream()
                .filter(c -> c.startsWith(prefix))
                .findFirst()
                .map(c -> c.split(";", 2)[0])   // isole
                .map(c -> c.split("=", 2))       // sépare nom et valeur
                .filter(parts -> parts.length == 2)
                .map(parts -> parts[1])
                .orElse(null);
    }

    private ResponseCookie expireCookie(String name) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .sameSite(sameSite)
                .maxAge(0)
                .build();
    }


}
