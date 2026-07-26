# Agent Instructions

## Source Documents

Read these before making product or security changes:

- `REQUIREMENTS.md`
- `API_DESIGN.md`
- `DECISIONS.md`
- `docs/tickets/README.md`

## Product Invariant

A user must not see, edit, delete, or infer the existence of another user's private data unless explicit sharing grants read access to a collection.

Default to `404 Not Found` for cross-owner private resource access so the API does not confirm another user's resource exists.

## Stack

- Backend: Node.js, TypeScript, NestJS, Prisma, SQLite for the take-home.
- Frontend: React, Vite, TypeScript, React Router, MUI.
- Auth: Auth0 Authorization Code with PKCE. Backend accepts access tokens, not ID tokens.

## Frontend Structure

Use feature-based folders:

- `src/features/collections`
- `src/features/bookmarks`
- `src/features/all`
- `src/features/health`
- `src/features/me`
Shared primitives belong under `src/components`, reusable hooks under `src/hooks`, reusable browser/string helpers under `src/utils`, API clients under `src/api`, and layout under `src/layout`. Do not move feature-specific workflow state into shared modules.

## Backend Structure

Use normal NestJS modules with controllers, services, DTOs, and tests near the behavior they verify. Keep ownership checks in the service/repository boundary and cover them with tests.

## Verification Rules

- Every claim about auth, ownership, sharing, or deploy gating needs an automated test, CI check, or documented manual smoke test.
- Run relevant build/tests before handing off changes. Backend tests require Node 22+ because they use `node:sqlite`; Node 24 is used in CI and local verification.
- Prefer small vertical commits that match the ticket history.
- Do not add decorative section comments. Comments should explain non-obvious decisions only.

## Agent Workflow

When implementing an endpoint or UI workflow, run `.agent/privacy-review.md` before considering the ticket done.

## Deployment Rules

Cloudflare Pages and Render deploys are intentionally gated by GitHub Actions. Keep Cloudflare native Git auto deploy disconnected or disabled, and keep Render Auto Deploy off unless the deployment strategy is intentionally changed and documented.

Do not commit platform secrets. Add Cloudflare, Render, and Playwright E2E credentials through GitHub Actions secrets/variables as documented in `README.md` and `DEPLOYMENT.md`.
