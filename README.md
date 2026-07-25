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

During development the frontend stores Auth0 SDK cache in `localstorage` so page refreshes do not force a new login. This improves local iteration but has a higher XSS exposure than memory-only token caching.

T03 collections adds:

- owner-scoped backend collections CRUD,
- frontend `/collections` page,
- create/edit/delete/filter collection workflows.

T04/T05 adds:

- owner-scoped backend bookmarks CRUD,
- frontend `/bookmarks` page,
- nullable bookmark collection assignment,
- safe collection deletion actions for non-empty collections.

T06 sharing adds:

- read-only collection sharing by known user email,
- `GET /collections?scope=shared`,
- shared collection/bookmark read access,
- owner-only share revoke,
- mutation denial for shared users.

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
npm run db:bootstrap --workspace backend
npm run db:seed --workspace backend
```

The default local database is `backend/prisma/dev.db`. `db:bootstrap` creates local SQLite tables for development and seeds two users. Prisma `db push` is kept as a standard ORM command, but local development currently uses the bootstrap script because Prisma's schema engine failed on this Windows machine with a blank engine error.

## Auth And Test Users

Real browser login uses the provided Auth0 tenant. The PDF only provides one known account: `candidate@test.com`. Cross-user behavior such as sharing is verified with backend test auth mode unless another Auth0 tenant user is available.

For API smoke tests:

```bash
$env:AUTH_MODE="test"
npm run dev:backend
```

Use bearer tokens such as `Bearer test:auth0|user-a` and `Bearer test:auth0|user-b`.

The frontend stores Auth0 SDK cache in localStorage during development so refreshes do not force another login. This is a dev trade-off and should be reconsidered for production.

## Completed Scope

- Auth0 login and `/me`
- Collections CRUD
- Bookmarks CRUD
- Explicit collection delete behavior with bookmarks
- Read-only collection sharing

## Known Gaps

- Backend e2e tests cover auth, owner privacy, bookmark ownership, collection delete actions, and read-only sharing.
- Frontend automated coverage is still limited to the health/status slice.
- SQLite schema bootstrap is manual SQL in `backend/prisma/bootstrap-dev-db.mjs` because `prisma db push` failed locally.
- Frontend bundle size is over Vite's default warning threshold after Auth0/MUI; this is not optimized yet.

## Product Invariant

A user must not see, edit, delete, or infer the existence of another user's private data unless explicit sharing grants read access to a collection.

See [REQUIREMENTS.md](./REQUIREMENTS.md), [API_DESIGN.md](./API_DESIGN.md), and [DECISIONS.md](./DECISIONS.md).
