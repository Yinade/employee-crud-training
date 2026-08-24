package com.lms_payment_service.lms_payment_service.config;

import com.lms_payment_service.lms_payment_service.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(reg -> reg

                        // Swagger
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public endpoints
                        .requestMatchers(
                                HttpMethod.GET,
                                "/Api/v1/payment-service/categories/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/Api/v1/payment-service/price/**"
                        ).permitAll()

                        // =====================================================
                        // TRAINING APPLICATION - UNITS CRUD WITHOUT LOGIN
                        // =====================================================
                        .requestMatchers(
                                "/Api/v1/payment-service/units/**"
                        ).permitAll()

                        // Everything else under payment service requires login
                        .requestMatchers(
                                "/Api/v1/payment-service/**"
                        ).authenticated()

                        .anyRequest().permitAll()
                )

                .exceptionHandling(ex -> ex

                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("application/json");

                            res.getWriter().write(
                                    "{\"error\":\"Unauthorized\"," +
                                            "\"message\":\"You must be logged in to access this resource.\"}"
                            );
                        })

                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType("application/json");

                            res.getWriter().write(
                                    "{\"error\":\"Forbidden\"," +
                                            "\"message\":\"You do not have permission to perform this action.\"}"
                            );
                        })
                )

                .addFilterBefore(
                        jwtAuthFilter,
                        org.springframework.security.web.authentication
                                .UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}