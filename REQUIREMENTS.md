# Full-Stack Developer Test Requirements

This document captures the working requirements and implementation decisions for the Bangkok Bank full-stack take-home exercise.

## Source

- Spec: `Full-Stack-Developer-Test.pdf`
- Auth0 discovery endpoint: `https://dev-yg.us.auth0.com/.well-known/openid-configuration`
- API audience: `https://bbl-candidate-test-api`
- Client ID: `H9F6QG5SzTKMv0tbmgxLj9LjG1EKVllA`
- Callback URL: `http://localhost:3000/callback`
- Logout URL: `http://localhost:3000`
- Scope: `openid profile email`

## Product

Build a private read-later bookmark manager.

The central invariant is privacy:

> A user must not see, edit, delete, or infer the existence of another user's private data unless explicit sharing grants read access to a collection.

## Architecture

- Monorepo with `/backend` and `/frontend`.
- Backend: Node.js, TypeScript, NestJS, Prisma, SQL persistence.
- Frontend: React, Vite, TypeScript, React Router v8 or newer, MUI v9 or newer.
- Authentication: Auth0 OIDC Authorization Code flow with PKCE using S256.

## Auth Decisions

- The frontend signs in through Auth0 using Authorization Code + PKCE.
- The backend accepts Auth0 access tokens as `Authorization: Bearer` credentials.
- The backend rejects ID tokens as API credentials.
- Runtime token validation must verify issuer, audience, signature, algorithm, and expiry.
- Auth0 `sub` is the primary user identity and is stored as `ownerId`.
- Email is display/contact metadata, not the authorization identity.

## Data Model

### User

- `id`: Auth0 subject.
- `email`
- `name`
- `createdAt`
- `updatedAt`

### Collection

- `id`
- `name`
- `ownerId`
- `createdAt`
- `updatedAt`

### Bookmark

- `id`
- `url`
- `title`
- `notes`
- `collectionId`: nullable.
- `ownerId`
- `createdAt`
- `updatedAt`

### CollectionShare

- `id`
- `collectionId`
- `ownerId`
- `sharedWithUserId`
- `permission`: default `read`
- `createdAt`
- `updatedAt`

## Collection Deletion

If a collection has bookmarks, deletion requires an explicit bookmark action:

- `uncategorize`: set affected bookmarks' `collectionId` to `null`.
- `move`: move affected bookmarks to another collection owned by the same user.
- `delete`: delete affected bookmarks.

If no action is provided and the collection has bookmarks, the backend returns `409 Conflict`.

## Sharing

Sharing is implemented as read-only by default.

- The owner can share or unshare a collection.
- The UI asks for an email address.
- The backend resolves the email to a known local user.
- Shared users can read the shared collection and its bookmarks.
- Shared users cannot create, update, delete, move, or share resources they do not own.
- Private list endpoints do not leak other users' data.
- Unknown share recipients should use a generic error that does not expose broader user enumeration details.

## API Scope

Required resources:

- `/me`
- `/collections`
- `/bookmarks`
- `/collections/:id/bookmarks`

Required operations:

- get one
- list
- create
- update with `PUT`
- partial update with `PATCH`
- delete
- filtering

Sharing endpoints:

- `POST /collections/:id/shares`
- `GET /collections/:id/shares`
- `DELETE /collections/:id/shares/:shareId`

## Frontend Scope

Pages:

- `/collections`
  - list collections
  - view collection
  - create collection
  - edit collection
  - delete collection
  - share collection
  - show read-only shared collections separately

- `/bookmarks`
  - list bookmarks
  - view bookmark details
  - create bookmark
  - edit bookmark
  - delete bookmark
  - filter by collection

Collection deletion UI must ask the user how to handle contained bookmarks:

- move to another owned collection
- make uncategorized
- delete bookmarks too

## Verification Requirements

Automated tests must prove the claims made in the README and design docs.

Priority tests:

- User A cannot list User B's collections or bookmarks.
- User A gets `404`, not `403`, when accessing User B's private resources.
- User A cannot update or delete User B's private resources.
- User A cannot move a bookmark into User B's collection.
- Deleting a collection with bookmarks requires an explicit action.
- `uncategorize`, `move`, and `delete` collection-deletion actions behave correctly.
- Shared users can read shared collections and bookmarks.
- Shared users cannot mutate shared collections or bookmarks.
- Token validation rejects missing, expired, wrong-issuer, wrong-audience, and wrong-algorithm credentials where feasible.

Test strategy:

- Runtime app path validates real Auth0 JWTs using discovery and JWKS.
- Tests may use deterministic mocked JWT claims for owner-boundary and data-access behavior.

## Submission Evidence

The final repository should include:

- `README.md`
- `API_DESIGN.md`
- `DECISIONS.md`
- `AI_WORKFLOW.md`
- `AGENTS.md` or equivalent agent rules
- `.agent/` with at least one reusable capability actually used
- `transcripts/` with real agent session logs or prompt history
- meaningful commit history

