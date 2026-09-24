# Build context: raiz do monorepo (ver docker-compose.yml)
ARG NODE_VERSION=24.21.0

FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable
WORKDIR /app
RUN chown node:node /app

# ---- manifests + install completo (dev/build) ----
FROM base AS deps
USER node
COPY --chown=node:node package.json yarn.lock .yarnrc.yml ./
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node packages/vc-api/package.json packages/vc-api/
COPY --chown=node:node packages/vc-app/package.json packages/vc-app/
# Só as dependências da API (sem Expo/React Native do app): imagem menor e build mais rápido.
# O package.json do app entra só para o Yarn resolver o workspace.
RUN yarn workspaces focus @votocerto/api

# ---- dev: código vem via volume no docker-compose ----
FROM deps AS dev
ENV NODE_ENV=development
EXPOSE 4000
CMD ["sh", "-c", "yarn --cwd packages/vc-api migration:run && yarn dev:api"]

# ---- build ----
FROM deps AS build
COPY --chown=node:node packages/vc-api packages/vc-api
RUN yarn --cwd packages/vc-api build

# ---- dependências de produção apenas ----
FROM deps AS prod-deps
RUN yarn workspaces focus @votocerto/api --production

# ---- runtime ----
# Fotos e planos ficam em /app/packages/vc-api/storage: monte um volume (fly.toml) ou use um CDN.
FROM base AS prod
ENV NODE_ENV=production
USER node
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/packages/vc-api/package.json ./packages/vc-api/package.json
COPY --chown=node:node --from=build /app/packages/vc-api/dist ./packages/vc-api/dist
WORKDIR /app/packages/vc-api
EXPOSE 4000
CMD ["sh", "-c", "node ../../node_modules/typeorm/cli.js -d dist/database/data-source.js migration:run && node dist/main.js"]
