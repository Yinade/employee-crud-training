package com.lms_payment_service.lms_payment_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;

@Configuration
public class AwsSnsConfig {

    @Value("${lms.aws.region:us-east-1}")
    private String awsRegion;

    @Bean
    public SnsClient snsClient() {
        return SnsClient.builder()
                .region(Region.of(awsRegion))
                // .credentialsProvider(...)  // if you’re not relying on default provider chain
                .build();
    }
}