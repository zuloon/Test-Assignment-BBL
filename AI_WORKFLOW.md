# AI Workflow

## Tools

- Codex desktop app for planning, implementation, shell checks, and review.
- Auth0 tenant discovery and JWKS were inspected before choosing the bearer credential design.
- Prisma Client is used as the ORM. Local SQLite schema setup uses a bootstrap script because Prisma schema engine commands failed locally.

## Decomposition

The work was split into vertical tickets:

- T01 foundation
- T02 login and current user
- T03 collections
- T04 bookmarks
- T05 collection delete behavior
- T06 read-only sharing
- T07 hardening and submission docs

This replaced an earlier layer-based plan because feature slices made it easier to manually test each workflow after implementation.

## What AI Did Well

- Turned the PDF into explicit implementation decisions and ticket acceptance criteria.
- Scaffolded full-stack slices quickly across NestJS, Prisma, Vite, Auth0, and MUI.
- Caught and corrected several integration issues through build and smoke checks.

## What AI Got Wrong

- Initially used full page links for frontend navigation, causing Auth0 memory cache to be lost on route changes.
- Initially left database setup dependent on Prisma `db push`, which failed locally.
- Initially used an absolute SQLite URL format that Prisma's engine could not open on Windows.

## Recovery

- Switched navigation to React Router `useNavigate`.
- Switched Auth0 dev cache to localStorage and documented the trade-off.
- Added `backend/prisma/bootstrap-dev-db.mjs` to create the local SQLite schema and seed two users.
- Used backend test auth mode for two-user smoke tests because the real Auth0 tenant has one known test account.

## Verification

Build checks run during implementation:

- `npm run build`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`

Automated tests:

- `npm run test --workspace backend` passed with 2 files and 7 tests.
- Frontend automated tests were removed from the active CI path; frontend verification currently relies on TypeScript/Vite build plus manual browser checks.

Manual/API smoke checks covered:

- `/health`
- `/me`
- collections CRUD
- bookmarks CRUD
- collection delete actions: `uncategorize`, `move`, `delete`
- read-only sharing and revoke

Known limitation: feature-level automated tests beyond the initial health slice are still incomplete.
