
# ── STAGE 1 : Build ───────────────────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

ARG MAVEN_PROFILE=docker
# Token passé via --build-arg uniquement (non persisté en ENV)
ARG SENTRY_TOKEN

# Utilisé uniquement pendant le build Maven, non exposé en layer runtime
RUN --mount=type=secret,id=sentry_token \
    echo "Token check: $([ -n \"$SENTRY_TOKEN\" ] && echo SET || echo EMPTY)"


# Dépendances d'abord — layer caché si pom.xml inchangé
COPY pom.xml .
COPY services/pom.xml services/pom.xml
COPY patient/pom.xml patient/pom.xml
COPY pharmacie/pom.xml pharmacie/pom.xml
COPY ordonnance/pom.xml ordonnance/pom.xml
COPY laboratoire/pom.xml laboratoire/pom.xml
COPY facturation/pom.xml facturation/pom.xml
COPY employe/pom.xml employe/pom.xml
COPY core/pom.xml core/pom.xml
COPY contracts/pom.xml contracts/pom.xml
COPY agenda/pom.xml agenda/pom.xml

COPY services/src services/src
COPY patient/src patient/src
COPY pharmacie/src pharmacie/src
COPY ordonnance/src ordonnance/src
COPY laboratoire/src laboratoire/src
COPY facturation/src facturation/src
COPY employe/src employe/src
COPY core/src core/src
COPY contracts/src contracts/src
COPY agenda/src agenda/src


RUN mvn dependency:go-offline -B -q

# clean inutile dans Docker (contexte toujours vierge)
# -DskipITs skippe les tests d'intégration uniquement
RUN mvn package -P${MAVEN_PROFILE} -DskipTests -B -q


# 🛠️ ASTUCE DE SÉCURITÉ : On cherche le plus gros JAR généré (le fat JAR exécutable)
# et on le renomme immédiatement en 'app.jar' pour simplifier le Stage 2.
RUN find services/target/ -name "*.jar" -not -name "*original*" -exec cp {} services/target/app.jar \;


# ── STAGE 2 : Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS app

# Sécurité : utilisateur non-root
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# On déclare à nouveau l'argument dans le stage 2 pour pouvoir l'utiliser
ARG MAVEN_PROFILE=docker

# Créer le répertoire logs avec les bonnes permissions
RUN mkdir -p /app/alogs && \
    chown -R spring:spring /app

# --chown intégré au COPY → 0 layer supplémentaire, JAR présent une seule fois
COPY --chown=spring:spring --from=builder /app/services/target/app.jar trinity.jar

# LIGNE POUR AFFICHER LE CONTENU DANS LA CONSOLE
RUN ls -la /app

USER spring

EXPOSE 8080

# JASYPT_PASSWORD injecté au runtime via docker run -e ou orchestrateur
ENTRYPOINT ["sh", "-c", "java \
  -Djasypt.encryptor.password=${JASYPT_PASSWORD} \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -jar /app/trinity.jar"]