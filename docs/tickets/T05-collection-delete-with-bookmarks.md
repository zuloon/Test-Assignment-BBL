# T05 - Collection Delete With Bookmarks

## Goal

Deliver safe collection deletion when the collection contains bookmarks.

## Full-Stack Slice

- Extend backend `DELETE /collections/:id`.
- Support `bookmarkAction=uncategorize`.
- Support `bookmarkAction=move` with `targetCollectionId`.
- Support `bookmarkAction=delete`.
- Return `409 Conflict` when deleting a non-empty collection without an action.
- Frontend collection delete dialog with three choices:
  - move bookmarks to another owned collection
  - make bookmarks uncategorized
  - delete bookmarks too

## Acceptance Criteria

- Empty collection can be deleted without an action.
- Non-empty collection deletion requires an explicit action.
- `uncategorize` preserves bookmarks with `collectionId = null`.
- `move` moves bookmarks only to another owned collection.
- `delete` deletes affected bookmarks.
- UI makes the destructive option explicit.

## Automated Tests

- Backend: missing action on non-empty collection returns `409`.
- Backend: `uncategorize`, `move`, and `delete` work.
- Backend: `move` to User B collection returns `404`.
- Frontend: delete dialog sends the selected action.
- Frontend: destructive delete option requires explicit selection.

## Manual Smoke Test

- Create collection with bookmarks.
- Delete with uncategorize and confirm bookmarks remain.
- Delete with move and confirm bookmarks move.
- Delete with delete and confirm bookmarks are removed.

## Out of Scope

- Sharing.

## Commit Message

`feat: add safe collection delete actions`
## Current backend coverage

Backend E2E now covers the full collection delete action matrix:

- empty collection delete without an action,
- non-empty collection delete without an action returns `409`,
- `uncategorize` preserves bookmarks with `collectionId = null`,
- `move` moves bookmarks to another owned collection,
- invalid move targets return `404`, including missing target, same collection, and another owner's collection,
- `delete` removes contained bookmarks,
- shared/read-only users cannot delete the owner's collection.
