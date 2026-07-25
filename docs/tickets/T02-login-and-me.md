# T02 - Login and Me

## Goal

Deliver a working login/current-user slice from frontend through backend.

## Full-Stack Slice

- Backend Auth0 access-token validation using issuer, audience, JWKS, RS256, and expiry.
- Deterministic test auth mode for backend e2e tests.
- Prisma `User` model and seed for at least two users.
- `GET /me`.
- Frontend Auth0 SPA login/logout using Authorization Code + PKCE.
- Frontend API client attaches access token as Bearer.
- UI shows current signed-in user.

## Acceptance Criteria

- Backend accepts valid access-token credentials for the configured API audience.
- Backend rejects missing credentials.
- Backend uses token `sub` as the current user id.
- Frontend requests `audience=https://bbl-candidate-test-api`.
- Signed-in user can see their `/me` information in the UI.

## Automated Tests

- Backend: missing token returns `401`.
- Backend: test token for User A returns User A from `/me`.
- Backend: verifier unit tests cover wrong issuer/audience where feasible.
- Frontend: API client attaches `Authorization: Bearer`.
- Frontend: current-user screen renders mocked `/me` data.

## Manual Smoke Test

- Login with Auth0 test user.
- Confirm frontend shows current user.
- Confirm unauthenticated API call is rejected.

## Out of Scope

- Collections/bookmarks CRUD.
- Sharing.

## Commit Message

`feat: add login and current user slice`

