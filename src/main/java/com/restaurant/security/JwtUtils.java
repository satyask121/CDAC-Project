package com.restaurant.security;

import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtils {

    // Token validity time (configured in application.properties)
    @Value("${jwt.expiration.time}")
    private long jwtExpirationTime;

    // Secret key (configured in application.properties)
    @Value("${jwt.secret}")
    private String jwtSecret;

    // Symmetric key used for signing & verifying JWT
    private SecretKey secretKey;

    // Called once when bean is created
    @PostConstruct
    public void init() {
        log.info("Initializing JWT Secret Key");
        secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generate JWT after successful login
     */
    public String generateToken(String email, Long userId, String role) {

        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationTime);

        return Jwts.builder()
                .subject(email)                  // username
                .issuedAt(now)                   // iat
                .expiration(expiry)              // exp
                .claims(Map.of(
                        "user_id", userId,
                        "role", role
                ))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validate JWT and return claims
     */
    public Claims validateToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
