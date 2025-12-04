# Use a Maven image to build the application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# Copy the pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline
# Copy the rest of the source code and build the application
COPY src ./src
RUN mvn package -DskipTests

# Use a slim JRE image to run the application
FROM openjdk:17-jre-slim
WORKDIR /app
# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar
# Expose the port the application will run on
EXPOSE 8080
# Set the command to run the application
CMD ["java", "-jar", "app.jar"]
