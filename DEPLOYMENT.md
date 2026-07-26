# Deployment

This project deploys the frontend and backend independently, with GitHub Actions as the CI gate for both deploy paths.

## CI Gate

The workflow runs on pushes and pull requests to `main` and can also be run manually.

Current gate order:

1. `verify`: install dependencies, generate Prisma Client, build both workspaces, and run backend tests.
2. `frontend_e2e`: run Playwright E2E against local backend/frontend dev servers after `verify` passes.
3. `backend_docker`: build the backend Docker image after `verify` passes.
4. `deploy_frontend`: deploy to Cloudflare Pages only after `frontend_e2e` passes.
5. `deploy_backend`: trigger Render only after `backend_docker` passes.

If Playwright fails or the E2E Auth0 secrets are missing, `deploy_frontend` will not run.

## Frontend: Cloudflare Pages

GitHub Actions deploys `frontend/dist` to Cloudflare Pages with `wrangler pages deploy` when all of these are true:

- the workflow runs on a push to `main`
- `verify` passes
- `frontend_e2e` passes
- repository variable `ENABLE_CLOUDFLARE_PAGES_DEPLOY` is `true`
- the Cloudflare Pages project already exists

Current Pages project:

```text
bbl-bookmark-manager
```

Required GitHub Actions secrets:

```text
CLOUDFLARE_API_TOKEN=<Cloudflare API token with Pages deploy access>
CLOUDFLARE_ACCOUNT_ID=<Cloudflare account id>
E2E_AUTH_EMAIL=<Auth0 test user email>
E2E_AUTH_PASSWORD=<Auth0 test user password>
```

Required GitHub Actions variables:

```text
ENABLE_CLOUDFLARE_PAGES_DEPLOY=true
CLOUDFLARE_PAGES_PROJECT_NAME=bbl-bookmark-manager
VITE_API_BASE_URL=<frontend build API base URL>
VITE_AUTH0_DOMAIN=dev-yg.us.auth0.com
VITE_AUTH0_CLIENT_ID=<Auth0 SPA client id>
VITE_AUTH0_AUDIENCE=https://bbl-candidate-test-api
```

Cloudflare API token permissions should include Account > Cloudflare Pages > Edit.

Cloudflare's native Git integration should stay disconnected, or auto deploys should be disabled if it is connected later. Otherwise Cloudflare can deploy directly from Git without waiting for GitHub Actions tests.

Auth0 must allow the deployed frontend URL:

- Allowed Callback URLs: `https://<frontend-domain>/callback`
- Allowed Logout URLs: `https://<frontend-domain>`
- Allowed Web Origins: `https://<frontend-domain>`

## Backend: Render Web Service

The backend runs on Render as a Docker Web Service.

Current Render service:

```text
Name: bbl-bookmark-backend
Runtime: Docker
Dockerfile path: backend/Dockerfile
Health check path: /health
Public URL: https://bbl-bookmark-backend.onrender.com
```

GitHub Actions triggers Render through a deploy hook when all of these are true:

- the workflow runs on a push to `main`
- `verify` passes
- `backend_docker` passes
- repository variable `ENABLE_RENDER_BACKEND_DEPLOY` is `true`
- GitHub secret `RENDER_BACKEND_DEPLOY_HOOK_URL` is set

Required GitHub Actions secret:

```text
RENDER_BACKEND_DEPLOY_HOOK_URL=<Render deploy hook URL>
```

Required GitHub Actions variable:

```text
ENABLE_RENDER_BACKEND_DEPLOY=true
```

Render Auto Deploy should stay off so backend deploys remain gated by GitHub Actions.

Render environment variables:

```text
NODE_ENV=production
PORT=3001
DATABASE_URL=file:/data/dev.db
FRONTEND_URL=https://bbl-bookmark-manager.pages.dev
AUTH0_ISSUER=https://dev-yg.us.auth0.com/
AUTH0_AUDIENCE=https://bbl-candidate-test-api
AUTH_MODE=auth0
```

The current deployment accepts ephemeral SQLite data for the take-home/demo flow. Attach a Render persistent disk at `/data` if durable SQLite state is required.