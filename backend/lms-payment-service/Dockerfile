# Use Amazon Corretto as the base image

FROM amazoncorretto:17

WORKDIR /app

# Add the JAR file to the container
ADD target/lms-payment-service-0.0.1-SNAPSHOT.jar lms-payment-service.jar

# Expose the default Spring Boot port
EXPOSE 8087

# Set the command to run the application
ENTRYPOINT ["java", "-jar", "lms-payment-service.jar"]

#this is a comment to test the push is working fine.