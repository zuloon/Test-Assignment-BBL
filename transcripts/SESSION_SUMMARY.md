# Session Summary

This is a condensed transcript note from the Codex implementation session.

## Requirement Clarification

- Backend accepts Auth0 access tokens, not ID tokens.
- Auth0 `sub` is the canonical user id.
- Private cross-owner access returns `404`.
- Deleting non-empty collections requires an explicit bookmark action.
- Sharing is implemented as read-only.
- SQLite is used for local SQL persistence.

## Implementation Notes

- T01 created the monorepo foundation.
- T02 added Auth0 login, backend bearer validation, Prisma User, and `/me`.
- T03 added owner-scoped collections.
- T04 added bookmarks.
- T05 added safe collection deletion actions.
- T06 added read-only collection sharing.

## Issues Found And Fixed

- `jose` is ESM-only; CommonJS transpilation turned dynamic import into `require`. Fixed with runtime dynamic import.
- Auth0 memory cache was lost on full page navigation. Fixed by using React Router navigation and localStorage cache for dev.
- Prisma SQLite path handling failed with the wrong relative path. Fixed by using `DATABASE_URL=file:./dev.db` relative to the Prisma schema folder.
- Prisma schema engine commands failed locally. Added a Node SQLite bootstrap script for local DB setup.
- Prisma client generation can fail on Windows if a backend process locks the query engine DLL. Stop backend before `db:generate`.
## Deployment And CI Updates

- Frontend deploys to Cloudflare Pages through GitHub Actions `wrangler pages deploy`; Cloudflare native Git integration is not connected.
- Backend deploys to Render through a GitHub Actions-triggered Render deploy hook; Render Auto Deploy is off.
- `deploy_frontend` waits for `frontend_e2e`, so Playwright must pass before Cloudflare deployment.
- `deploy_backend` waits for `backend_docker`, so Render deploy is gated by Docker build validation.
- GitHub Actions secrets and variables are documented instead of committed.

## Refactor And Test Updates

- Reused frontend signed-out, loading, empty, and search UI through shared components.
- Moved URL normalization/domain extraction, search matching, clipboard writing, and copied-state handling into shared utilities/hooks.
- Expanded backend e2e sharing coverage for unknown recipients, self-sharing, email normalization, permission upsert, owner-only share listing, and owner-only revocation.
