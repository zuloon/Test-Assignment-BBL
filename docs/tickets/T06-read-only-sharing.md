# T06 - Read-Only Sharing

## Goal

Deliver read-only collection sharing end to end without weakening private ownership boundaries.

## Full-Stack Slice

- Prisma `CollectionShare` model.
- Backend sharing API:
  - `POST /collections/:id/shares`
  - `GET /collections/:id/shares`
  - `DELETE /collections/:id/shares/:shareId`
- Read access to shared collections.
- Read access to bookmarks in shared collections.
- Frontend collection share UI.
- Frontend shared collections section with read-only treatment.

## Acceptance Criteria

- Owner can share a collection with a known user by email.
- Owner can list and revoke shares.
- Shared user can read the shared collection and contained bookmarks.
- Shared user cannot update, delete, or re-share the collection.
- Shared user cannot mutate bookmarks in the shared collection.
- Users with no ownership/share access receive `404`.
- UI hides or disables mutation controls for shared resources.

## Automated Tests

- Backend: owner share/list/revoke.
- Backend: shared user read succeeds.
- Backend: shared user mutations fail.
- Backend: unshared private access returns `404`.
- Frontend: share form calls expected API.
- Frontend: shared collections render read-only controls.

## Manual Smoke Test

- Seed or create two users.
- Share a collection from owner to recipient.
- Login/test as recipient and confirm read-only access.
- Revoke share and confirm access disappears.

## Commit Message

`feat: add read-only sharing`

