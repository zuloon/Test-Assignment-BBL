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
  "email": "person@example.com"
}
```

`GET /collections/:id/shares`

Owner-only. Lists shares for a collection.

`DELETE /collections/:id/shares/:shareId`

Owner-only. Revokes a share.

### Bookmarks

`GET /bookmarks`

Lists bookmarks owned by the current user.

Filters:

- `collectionId`

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

## Privacy Enforcement

Every repository query must include either:

- an owner predicate using the current user's `sub`, or
- an explicit read-only share predicate for read operations.

Mutation operations are owner-only.

Nested writes must validate both sides of the relationship. For example, assigning a bookmark to a collection must verify that the collection is owned by the current user.
