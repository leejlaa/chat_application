# Stage 1: Build
FROM openjdk:19-jdk AS build

WORKDIR /app

# Copy Maven files
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Copy source code
COPY src src

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Build app
RUN ./mvnw clean package -DskipTests

# Stage 2: Run
FROM openjdk:19-jdk

WORKDIR /app

# Expose port BEFORE app starts
EXPOSE 8080

# Copy the JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java","-jar","app.jar"]
