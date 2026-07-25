# T04 - Bookmarks Feature

## Goal

Deliver owned bookmarks CRUD end to end.

## Full-Stack Slice

- Prisma `Bookmark` model with nullable `collectionId`.
- Backend bookmarks API:
  - `GET /bookmarks`
  - `POST /bookmarks`
  - `GET /bookmarks/:id`
  - `PUT /bookmarks/:id`
  - `PATCH /bookmarks/:id`
  - `DELETE /bookmarks/:id`
  - `GET /collections/:id/bookmarks`
  - filtering by `collectionId`
- Frontend `/bookmarks` route:
  - list
  - detail
  - create
  - edit
  - delete
  - filter by collection
  - support uncategorized bookmarks

## Acceptance Criteria

- User can manage bookmarks from the UI.
- User can assign bookmarks only to their own collections.
- User can leave bookmarks uncategorized.
- User A never sees User B private bookmarks.
- Cross-owner bookmark access returns `404`.

## Automated Tests

- Backend: User A list excludes User B bookmark.
- Backend: User A get/update/delete User B bookmark returns `404`.
- Backend: create/update with User B collection id returns `404`.
- Backend: filter by owned collection returns only matching owned bookmarks.
- Frontend: bookmark list/create/edit/delete/filter interactions call expected API methods.

## Manual Smoke Test

- Login.
- Create a bookmark in a collection.
- Create an uncategorized bookmark.
- Filter by collection.
- Edit and delete a bookmark.
- Confirm refresh keeps persisted state.

## Out of Scope

- Deleting collections containing bookmarks.
- Sharing.

## Commit Message

`feat: add bookmarks feature`

