# Deployment

This project deploys the frontend and backend independently.

## Frontend: Cloudflare Pages

GitHub Actions deploys `frontend/dist` to Cloudflare Pages when all of these are true:

- the workflow runs on a push to `main`
- repository variable `ENABLE_CLOUDFLARE_PAGES_DEPLOY` is `true`
- the Cloudflare Pages project already exists

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Required GitHub Actions variables:

- `ENABLE_CLOUDFLARE_PAGES_DEPLOY=true`
- `CLOUDFLARE_PAGES_PROJECT_NAME`
- `VITE_API_BASE_URL`
- `VITE_AUTH0_DOMAIN`
- `VITE_AUTH0_CLIENT_ID`
- `VITE_AUTH0_AUDIENCE`

Cloudflare API token permissions should include Account > Cloudflare Pages > Edit.

Auth0 must allow the deployed frontend URL:

- Allowed Callback URLs: `https://<frontend-domain>/callback`
- Allowed Logout URLs: `https://<frontend-domain>`
- Allowed Web Origins: `https://<frontend-domain>`

## Backend: Docker over SSH

The backend deploy job runs separately and updates only the `backend` Docker Compose service when all of these are true:

- the workflow runs on a push to `main`
- repository variable `ENABLE_SSH_DEPLOY` is `true`
- the target server has Docker Compose and access to this Git repository

Required GitHub Actions secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`

Required GitHub Actions variables:

- `ENABLE_SSH_DEPLOY=true`
- `DEPLOY_PATH`

On the backend host, set runtime environment values for:

- `DATABASE_URL`
- `FRONTEND_URL`
- `AUTH0_ISSUER`
- `AUTH0_AUDIENCE`
- `AUTH_MODE=auth0`
