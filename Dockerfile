# === Build Stage ===
FROM maven:3.9.6-eclipse-temurin-17 as builder

WORKDIR /app

# Copy pom.xml and download dependencies first (to use Docker cache)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the app
COPY . .

# Package the application
RUN mvn clean package -DskipTests

# === Run Stage ===
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy the jar file from the builder stage
COPY --from=builder /app/target/*.jar demo-0.0.1-SNAPSHOT.jar

# Expose port (default Spring Boot port)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "demo-0.0.1-SNAPSHOT.jar"]
