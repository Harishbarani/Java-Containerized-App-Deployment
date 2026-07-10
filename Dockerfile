# ---------- Build Stage ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
 
# Copy pom.xml first to leverage Docker layer caching for dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B
 
# Copy source (includes static JS/HTML/CSS under resources/static, served by Spring Boot)
COPY src ./src
RUN mvn clean package -DskipTests
 
# ---------- Runtime Stage ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
 
# Copy only the built jar from the build stage (keeps final image small)
COPY --from=build /app/target/*.jar app.jar
 
# Expose the Spring Boot port
EXPOSE 8080
 
# Run as non-root user for better container security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
 
# H2 is file/in-memory, so no external DB env vars are required to start the app
ENTRYPOINT ["java", "-jar", "app.jar"]