package com.lms_payment_service.lms_payment_service.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.servers.Server;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "LMS Payment Service API",
                version = "1.0",
                description = "API documentation for the Logistics Management System - Payment Ser",
                contact = @Contact(name = "LMS Team", email = "support@lms.com"),
                license = @License(name = "Apache 2.0", url = "http://www.apache.org/licenses/LICENSE-2.0.html")
        ),
        servers = { @Server(url = "http://localhost:8087", description = "Local Dev Server") },
        security = { @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth") } // <<< add this
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenAPIConfig {

}
