package com.lms_payment_service.lms_payment_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {
    @Value("${jwt.secretKey}")
    private String secretKey;

    private Key key() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKey));
    }

    public Claims parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
    }

    public <T> T extract(String token, Function<Claims, T> fn) {
        Claims c = parse(token);
        return fn.apply(c);
    }

    public boolean isExpired(String token) {
        Date exp = extract(token, Claims::getExpiration);
        return exp != null && exp.before(new Date());
    }
}
