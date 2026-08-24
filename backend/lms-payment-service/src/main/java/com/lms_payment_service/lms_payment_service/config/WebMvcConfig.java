package com.lms_payment_service.lms_payment_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload.base-dir:./uploads}")
    private String baseDir;

    @Value("${file.upload.public-prefix:/uploads}")
    private String publicPrefix;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String prefix = publicPrefix.startsWith("/") ? publicPrefix : "/" + publicPrefix;
        prefix = prefix.replaceAll("/+$", "");            // trim trailing slash
        String location = "file:" + Paths.get(baseDir).toAbsolutePath().toString() + "/";

        registry.addResourceHandler(prefix + "/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);
    }
}