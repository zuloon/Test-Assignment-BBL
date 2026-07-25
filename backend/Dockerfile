FROM node:24-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

FROM deps AS build
COPY backend backend
RUN npm run db:generate --workspace backend
RUN npm run build --workspace backend

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_URL=file:/data/dev.db

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/backend/package.json backend/package.json
COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/backend/prisma backend/prisma

VOLUME ["/data"]
EXPOSE 3001
CMD ["sh", "-c", "node backend/prisma/bootstrap-dev-db.mjs && node backend/dist/main.js"]
