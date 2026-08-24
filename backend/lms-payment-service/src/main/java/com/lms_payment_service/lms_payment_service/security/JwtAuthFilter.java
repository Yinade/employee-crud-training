package com.lms_payment_service.lms_payment_service.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwt;

    public JwtAuthFilter(JwtService jwt){ this.jwt = jwt; }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String auth = req.getHeader(HttpHeaders.AUTHORIZATION);
        if (auth == null || !auth.startsWith("Bearer ")) {
            chain.doFilter(req, res);
            return;
        }
        String token = auth.substring(7);
        try {
            if (jwt.isExpired(token)) { chain.doFilter(req, res); return; }

            Claims claims = jwt.parse(token);
            String username = claims.getSubject();

            // accountId
            Long accountId = null;
            Object rawId = claims.get("accountId");
            if (rawId instanceof Integer i) accountId = i.longValue();
            else if (rawId instanceof Long l) accountId = l;
            else if (rawId instanceof String s) accountId = Long.valueOf(s);

            // roles -> ROLE_x authorities (optional but useful)
            Collection<SimpleGrantedAuthority> auths = new java.util.ArrayList<>();
            Object rolesClaim = claims.get("roles");
            if (rolesClaim instanceof List<?> rs) {
                rs.stream().filter(Objects::nonNull).map(Object::toString)
                        .forEach(r -> auths.add(new SimpleGrantedAuthority(r)));
            }

            // perms -> PERM_x authorities (this is what we’ll use in @PreAuthorize)
            Object permsClaim = claims.get("perms");
            if (permsClaim instanceof List<?> ps) {
                ps.stream().filter(Objects::nonNull).map(Object::toString)
                        .forEach(p -> auths.add(new SimpleGrantedAuthority("PERM_" + p)));
            }

            CurrentUser principal = new CurrentUser(accountId, username, auths);
            var authentication = new UsernamePasswordAuthenticationToken(principal, null, auths);
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception ignored) {
            // fall through; security rules will 401/403 later
        }
        chain.doFilter(req, res);
    }
}