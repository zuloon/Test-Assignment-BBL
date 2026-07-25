# BBL Bookmark Manager

Private read-later app for the Bangkok Bank full-stack developer take-home exercise.

## Current Status

Implementation is ticket-driven. The active plan is in [docs/tickets/README.md](./docs/tickets/README.md).

T01 foundation adds:

- backend NestJS health endpoint,
- frontend Vite status screen,
- feature-based frontend folder structure,
- repo agent guidance,
- reusable agent checklist,
- transcript folder structure.

T02 login/current-user adds:

- backend Auth0 access-token validation,
- deterministic backend test auth mode,
- Prisma `User` model and seed script,
- `/me` endpoint,
- frontend Auth0 login/logout and current-user screen.

## Project Shape

```text
backend/      NestJS API
frontend/     Vite React app
docs/tickets/ Vertical feature tickets
.agent/       Reusable agent capabilities
transcripts/  Real session notes and prompt history
```

## Install

Use Node.js `>=22.22.0`. The frontend uses React Router v8, MUI v9, and Vite v8.

```bash
npm install
```

## Run

```bash
npm run dev:backend
npm run dev:frontend
```

Backend defaults to `http://localhost:3001`.
Frontend defaults to `http://localhost:3000`.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

## Database

```bash
npm run db:generate --workspace backend
npm run db:push --workspace backend
npm run db:seed --workspace backend
```

The default local database is `backend/prisma/dev.db`.

## Product Invariant

A user must not see, edit, delete, or infer the existence of another user's private data unless explicit sharing grants read access to a collection.

See [REQUIREMENTS.md](./REQUIREMENTS.md), [API_DESIGN.md](./API_DESIGN.md), and [DECISIONS.md](./DECISIONS.md).
