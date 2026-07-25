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

- `src/collections`
- `src/bookmarks`
- `src/health`
- `src/shared`

Shared primitives, layout, and API helpers belong under `src/shared`. Do not mix feature-specific UI into `src/shared`.

## Backend Structure

Use normal NestJS modules with controllers, services, DTOs, and tests near the behavior they verify. Keep ownership checks in the service/repository boundary and cover them with tests.

## Verification Rules

- Every claim about auth, ownership, or sharing needs an automated test or a documented manual smoke test.
- Test each ticket before starting the next ticket.
- Prefer small vertical commits that match the ticket history.
- Do not add decorative section comments. Comments should explain non-obvious decisions only.

## Agent Workflow

When implementing an endpoint or UI workflow, run `.agent/privacy-review.md` before considering the ticket done.
