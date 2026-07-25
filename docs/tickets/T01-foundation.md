# T01 - Foundation

## Goal

Create the repo foundation needed to build and test vertical features.

## Full-Stack Slice

- Root README with ticket-driven workflow.
- Root `AGENTS.md` with stack, product invariant, and verification rules.
- `.agent/` with at least one reusable capability we will actually use.
- `transcripts/` structure for real session notes.
- `/backend` NestJS skeleton with `GET /health`.
- `/frontend` Vite React skeleton with a health/status screen.
- Shared env examples for Auth0 and API URL.
- Basic build/test scripts for backend and frontend.

## Acceptance Criteria

- A reviewer can install backend and frontend dependencies.
- Backend `GET /health` returns OK.
- Frontend renders a status page and can display backend health.
- Agent guidance points to `REQUIREMENTS.md`, `API_DESIGN.md`, and `DECISIONS.md`.

## Automated Tests

- Backend health endpoint test.
- Frontend status screen test with mocked health response.

## Manual Smoke Test

- Run backend locally.
- Run frontend locally.
- Open frontend and confirm backend health is visible.

## Out of Scope

- Auth0 login.
- Prisma schema.
- Collections/bookmarks.

## Commit Message

`feat: add full-stack foundation`

