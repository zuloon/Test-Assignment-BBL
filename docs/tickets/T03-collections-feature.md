# T03 - Collections Feature

## Goal

Deliver owned collections CRUD end to end.

## Full-Stack Slice

- Prisma `Collection` model.
- Backend collections API:
  - `GET /collections`
  - `POST /collections`
  - `GET /collections/:id`
  - `PUT /collections/:id`
  - `PATCH /collections/:id`
  - `DELETE /collections/:id` for empty collections
  - name filtering
- Frontend `/collections` route:
  - list owned collections
  - view detail
  - create
  - edit
  - delete empty collection

## Acceptance Criteria

- User can manage their own collections from the UI.
- User A never sees User B private collections in lists.
- Cross-owner get/update/patch/delete returns `404`, not `403`.
- Frontend handles loading, empty, error, create, edit, and delete states.

## Automated Tests

- Backend: User A list excludes User B collection.
- Backend: User A get/update/patch/delete User B collection returns `404`.
- Backend: User A can create, update, patch, and delete own empty collection.
- Frontend: collections list renders mocked data.
- Frontend: create/edit/delete interactions call expected API methods.

## Manual Smoke Test

- Login.
- Create a collection.
- Edit it.
- Delete it.
- Confirm refresh keeps persisted state.

## Out of Scope

- Bookmarks.
- Delete behavior for collections containing bookmarks.
- Sharing.

## Commit Message

`feat: add collections feature`

