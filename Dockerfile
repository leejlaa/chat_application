FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

# Copy the whole project into the container
COPY . .

# Expose default Spring Boot port
EXPOSE 8080

# Start Spring Boot app via Maven
CMD ["mvn", "spring-boot:run"]
