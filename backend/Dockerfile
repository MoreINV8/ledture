FROM maven:3.9.16-eclipse-temurin-21-noble AS build

WORKDIR /backend

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /backend

COPY --from=build /backend/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]