# API Design

## Auth

Every API route requires `Authorization: Bearer <access_token>` unless explicitly documented otherwise.

The API validates:

- issuer: `https://dev-yg.us.auth0.com/`
- audience: `https://bbl-candidate-test-api`
- signing key from Auth0 JWKS
- algorithm: RS256
- expiry

The current user id is the validated token's `sub` claim.

## Error Shape

The current implementation uses NestJS default JSON error responses such as `{ "message": "...", "error": "Not Found", "statusCode": 404 }`.

Private resources owned by another user return `404 Not Found`.

## Resources

### `GET /me`

Returns the current signed-in user.

### Collections

`GET /collections`

Lists collections owned by the current user. Shared collections are returned only with `?scope=shared`.

Filters:

- `name`
- `scope=owned|shared`

`POST /collections`

Creates an owned collection.

`GET /collections/:id`

Returns an owned collection or a read-only shared collection.

`PUT /collections/:id`

Replaces an owned collection.

`PATCH /collections/:id`

Partially updates an owned collection.

`DELETE /collections/:id`

Deletes an owned collection. If bookmarks exist, request body must include one of:

```json
{ "bookmarkAction": "uncategorize" }
```

```json
{ "bookmarkAction": "delete" }
```

```json
{
  "bookmarkAction": "move",
  "targetCollectionId": "collection-id"
}
```

If `targetCollectionId` is provided, it must identify another collection owned by the current user.

### Collection Bookmarks

`GET /collections/:id/bookmarks`

Returns bookmarks in an owned collection or a read-only shared collection.

### Sharing

`POST /collections/:id/shares`

Owner-only. Shares a collection with a known user by email.

```json
{
  "email": "person@example.com",
  "permission": "read"
}
```

`permission` accepts `read` or `edit`. The current authorization model still treats shared users as read-only; `edit` is stored for the future role workflow.

`GET /collections/:id/shares`

Owner-only. Lists shares for a collection.

`DELETE /collections/:id/shares/:shareId`

Owner-only. Revokes a share.

### Bookmarks

`GET /bookmarks`

Lists bookmarks owned by the current user.

Filters:

- `collectionId`
- `q`: searches `title`, `url`, and `notes`

`POST /bookmarks`

Creates an owned bookmark. If `collectionId` is supplied, it must belong to the current user.

`GET /bookmarks/:id`

Returns an owned bookmark. Shared collection bookmarks are read through `/collections/:id/bookmarks`.

`PUT /bookmarks/:id`

Replaces an owned bookmark.

`PATCH /bookmarks/:id`

Partially updates an owned bookmark.

`DELETE /bookmarks/:id`

Deletes an owned bookmark.


## Agent First Attempts And Corrections

The assignment asks for a record of where the agent's first attempt was wrong. These issues changed the final API and integration design.

### Auth0 session disappeared after reload/navigation

First attempt: the frontend used normal page navigation and the Auth0 SDK's default in-memory token cache. Login worked, and the backend `/me` path could create/read the user through Prisma, but refreshing the page or navigating with full-page links lost the SPA token cache and made the app ask for login again.

Correction: frontend navigation was changed to React Router navigation so route changes do not reload the page. The Auth0 SDK was also configured with localStorage cache for the development/test flow. The API design stayed the same: `/me` returns the backend's current user record, but it does not replace Auth0 session storage in the browser.

### Prisma schema/database did not exist or could not be opened

First attempt: the backend Prisma client was wired before the local SQLite schema was reliably created. After Auth0 login, `/me` hit Prisma runtime failures such as `The table main.User does not exist in the current database`. A later attempt also used a SQLite path format that Prisma could not open on Windows, producing `Error code 14: Unable to open the database file`.

Correction: local development now uses `DATABASE_URL=file:./dev.db`, relative to the Prisma schema folder, and `backend/prisma/bootstrap-dev-db.mjs` creates the SQLite tables and seed users when Prisma schema engine commands are not reliable locally. The application still uses Prisma Client as the ORM; the bootstrap script is an environment recovery path, not a second data-access layer.

### Collection delete did not handle non-empty collection conflict in the UI

First attempt: the backend correctly returned `409 Conflict` when deleting a collection that still had bookmarks without an explicit action, but the frontend delete flow did not yet guide the user through the required decision.

Correction: the API contract was kept strict: `DELETE /collections/:id` requires `bookmarkAction` for non-empty collections. The frontend now opens a delete dialog and sends one of `uncategorize`, `move`, or `delete`, with inline validation for missing move targets and inline error display for backend failures.

These corrections are reflected in the final API contract: authentication remains bearer access-token based, private resources still return `404`, database setup is explicit, and destructive collection deletion requires a deliberate user choice.
## Privacy Enforcement

Every repository query must include either:

- an owner predicate using the current user's `sub`, or
- an explicit read-only share predicate for read operations.

Mutation operations are owner-only.

Nested writes must validate both sides of the relationship. For example, assigning a bookmark to a collection must verify that the collection is owned by the current user.
