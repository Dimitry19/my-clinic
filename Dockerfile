# ── STAGE 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Récupérer le hash Git depuis la machine hôte au moment du build.
# Utilisé par version.js pour générer version.json dans assets.
# Passer avec : docker build --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) .
#ARG GIT_COMMIT=N/A
#ENV GIT_COMMIT=$GIT_COMMIT

# Dépendances d'abord (layer caché si package.json inchangé)
COPY package*.json ./
# Fichiers de config nécessaires au build
#COPY version.js ./
#COPY version.json ./
#COPY clear-ssr-cache.js ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build:ssr

# ── STAGE 2 : Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS server

WORKDIR /app

# Copier uniquement les fichiers nécessaires au runtime
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json ./
#COPY --from=build /app/version*.js ./
#COPY --from=build /app/version*.json ./
#COPY --from=build /app/clear-ssr-cache*.js ./

# Installer UNIQUEMENT les dépendances de production
RUN npm install --legacy-peer-deps --omit=dev

# ── Sécurité : utilisateur non-root ──────────────────────────────────────────
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# production active les optimisations Node (cache, compression, etc.)
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["sh", "-c", "node dist/clinique-trinite-fe-ssr/server/server.mjs"]