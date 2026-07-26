# AI Workflow

## Tools

- Codex desktop app for planning, implementation, shell checks, browser-assisted deployment setup, and review.
- Chrome browser control for Cloudflare Pages, Render, and GitHub Actions dashboard work.
- Auth0 tenant discovery and JWKS were inspected before choosing the bearer credential design.
- Prisma Client is used as the ORM. Local SQLite schema setup uses a bootstrap script because Prisma schema engine commands failed locally on this Windows machine.

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
- Caught and corrected integration issues through build, test, browser, and deployment checks.
- Converted repeated frontend signed-out, loading, empty, search, URL, and clipboard patterns into reusable components, hooks, and utilities.
- Set up CI-gated deploys so Cloudflare Pages waits for Playwright E2E and Render waits for Docker validation.

## What AI Got Wrong

- Initially used full page links for frontend navigation, causing Auth0 memory cache to be lost on route changes.
- Initially left database setup dependent on Prisma `db push`, which failed locally.
- Initially used an absolute SQLite URL format that Prisma's engine could not open on Windows.
- Initially configured backend deployment through Docker runtime images that missed workspace dependencies; Render failed until the runtime image copied the built backend workspace and root `node_modules`.
- Initially assumed frontend deploy gating was complete with `verify`, but Playwright E2E had to be added as its own `frontend_e2e` job before `deploy_frontend`.

## Recovery

- Switched navigation to React Router `useNavigate`.
- Switched Auth0 dev cache to localStorage and documented the trade-off.
- Added `backend/prisma/bootstrap-dev-db.mjs` to create the local SQLite schema and seed two users.
- Used backend test auth mode for two-user smoke tests because the real Auth0 tenant has one known test account.
- Added backend share edge-case coverage for unknown recipients, self-share prevention, email normalization, permission upsert, owner-only share listing, and owner-only revocation.
- Added GitHub Actions secrets/variables documentation for Cloudflare, Render, and Playwright E2E credentials instead of committing sensitive values.

## Verification

Build checks run during implementation:

- `npm run build`
- `npm run build --workspace backend`
- `npm run build --workspace frontend`

Automated tests:

- `npm run test --workspace backend` passes with 2 files and 13 tests when run on Node 24, covering privacy boundaries, bookmark ownership validation, collection delete action branches, search, and sharing edge cases.
- `npm run test:e2e --workspace frontend` runs Playwright real-browser E2E against local backend/frontend dev servers and is the CI gate for Cloudflare Pages deployment.
- GitHub Actions `deploy_frontend` is blocked when `frontend_e2e` fails or required E2E secrets are missing.

Deployment checks:

- Cloudflare Pages project `bbl-bookmark-manager` deploys through GitHub Actions `wrangler pages deploy`; native Cloudflare Git integration is not connected.
- Render Web Service `bbl-bookmark-backend` deploys through a GitHub Actions-triggered Render deploy hook; Render Auto Deploy is off.

Manual/API smoke checks covered:

- `/health`
- `/me`
- collections CRUD
- bookmarks CRUD
- collection delete actions: `uncategorize`, `move`, `delete`
- read-only sharing and revoke
- signed-out, loading, empty, and error UI states

Known limitations:

- Component-level frontend Vitest tests are not included; frontend coverage is via Playwright E2E, TypeScript/Vite build, and manual QA evidence.
- The current Render SQLite database is ephemeral unless a persistent disk is attached at `/data`.