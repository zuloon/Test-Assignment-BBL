# 2026-07-26 Frontend Error Handling, Manual QA, And README Update

This transcript note captures the Codex session where the frontend error-handling gaps were reviewed, fixed, manually tested in Chrome, and documented in the README.

Secrets and browser session details are omitted. No git commit or push was made.

## User Request

The user first asked, in Thai, to check whether the project already handled frontend errors well enough to avoid bad UX:

> นายลองเช็คหน่อยว่า project เราตอนนี้มีการ handle error สำหรับ frontend เรียบร้อยแล้วไหมเพื่อไม่ให้ ux ที่ไม่ดีออกไป

Codex initially inspected the current workspace and found only `.tmp-cloudflare-upload` build artifacts. The user corrected the project location:

> C:\Users\wongs\interviews\bbl project อยู่นี้นะ

Codex moved to `C:\Users\wongs\interviews\bbl` and reviewed the source.

## Frontend Error Handling Review

Codex inspected:

- `frontend/src/main.tsx`
- `frontend/src/app.tsx`
- `frontend/src/shared/api/apiClient.ts`
- `frontend/src/all/AllPage.tsx`
- `frontend/src/bookmarks/BookmarksPage.tsx`
- `frontend/src/collections/CollectionsPage.tsx`
- `frontend/src/health/HealthPage.tsx`
- `frontend/src/me/MePage.tsx`

Findings:

- Initial page load states were mostly covered with loading, empty, signed-out, and API error UI.
- Route fallback existed through `path="*"`.
- There was no root React `ErrorBoundary`, so a render crash could become a blank page.
- Several mutation flows had unhandled promise rejection risk:
  - bookmark create/update
  - bookmark delete
  - collection create/update
  - share dialog initial share loading
  - share revoke
- `apiClient` showed generic status messages such as `API request failed with 400` instead of parsing backend error responses.

## User Request To Fix

The user then asked:

> ปรับแก้ได้เลย

Codex implemented scoped fixes without committing or pushing.

## Implemented Changes

Files changed:

- `frontend/src/shared/errors/AppErrorBoundary.tsx`
- `frontend/src/app.tsx`
- `frontend/src/shared/api/apiClient.ts`
- `frontend/src/bookmarks/BookmarksPage.tsx`
- `frontend/src/collections/CollectionsPage.tsx`

Details:

- Added `AppErrorBoundary` with a user-facing fallback and `Reload App` action.
- Wrapped the app tree in `AppErrorBoundary`.
- Updated `apiClient` to parse NestJS error response bodies:
  - `message`
  - `message[]`
  - `error`
  - fallback to `statusText` or status code.
- Added `204` response handling.
- Added inline action error handling for bookmark save/delete and clipboard failure.
- Added saving/deleting disabled states for bookmark actions.
- Added inline form error handling for collection save.
- Added loading/error handling for collection share list loading.
- Added inline error handling for share revoke.

Verification:

- `npm run build --workspace frontend` passed.
- Vite warned that Node `20.15.0` is below Vite's recommended `20.19+` or `22.12+`.
- `npm run test --workspace frontend` ran but failed with `No test files found`, because frontend tests are not present.

## Manual QA Request

The user then asked Codex to test the app in the Chrome window that was already open:

> ทีนี้เราอยากให้นายลองไป test หน่อยเราเปิด chorm ของหน้าเว็บไว้ละใช้ chorm นั้นได้เลยสิ่งทีเราอยากให้ test คือ test feature CRUD ทั้งหมดที่จะเป็น error และแคปผลไว้และ flow ที่สำเร็จแคปผลไว้เช่นกันและนำมาปรับการเขียน readme ใหม่เพื่อให้คนภายนอกเข้ามาอ่านและเข้าใจได้ง่ายด้วยอธิบาย flow เลยว่าเราทำอะไรกันไปยังไงและแอปเป็นอย่างไร

The user also clarified:

> แต่ไม่ต้อง push หรือแก้อะไรขึ้น git นะ

Codex confirmed that it would not push or commit.

## Chrome Manual QA

Codex connected to the existing Chrome tab:

- URL: `http://localhost:3000/collections`
- Visible signed-in user: `Candy Candy`

Codex tested timestamped QA data to avoid colliding with seed data. The QA collection/bookmark were cleaned up after verification.

### Success Flows Tested

Collections:

- Created a QA collection.
- Edited the QA collection name.
- Deleted the QA collection safely.

Bookmarks:

- Created an uncategorized QA bookmark.
- Edited its title, URL, and notes.
- Searched by updated title and verified exactly one result.
- Deleted the QA bookmark and verified the empty filtered state.

Read view:

- Opened All Vault after cleanup and verified grouped collections/bookmarks still loaded.

### Error Flows Tested

- Share unknown user:
  - Opened `Share Access`.
  - Entered a non-existent email.
  - Verified inline backend error: `User not found`.

- Delete collection validation:
  - Opened delete dialog.
  - Selected `Move bookmarks to another collection`.
  - Did not select a target collection.
  - Verified inline validation: `Choose a collection to move bookmarks into.`

## Screenshot Evidence

Screenshots were saved under:

```text
docs/screenshots/manual-qa/
```

Files:

- `collectionCreated.png`
- `collectionDeleted.png`
- `bookmarkCreated.png`
- `bookmarkUpdated.png`
- `bookmarkSearch.png`
- `bookmarkDeleted.png`
- `allVault.png`
- `shareError.png`
- `deleteMoveError.png`

## README Rewrite

Codex rewrote `README.md` for an external reviewer. The new README explains:

- what the app does,
- the privacy invariant,
- implemented scope,
- app flow,
- project shape,
- tech stack,
- install/config/database/run/test/build instructions,
- Docker usage,
- API summary,
- manual QA evidence with screenshots,
- frontend error-handling notes,
- auth/test users,
- known gaps.

## Final State

Changed files at the end of the session:

- `README.md`
- `frontend/src/app.tsx`
- `frontend/src/bookmarks/BookmarksPage.tsx`
- `frontend/src/collections/CollectionsPage.tsx`
- `frontend/src/shared/api/apiClient.ts`
- `frontend/src/shared/errors/AppErrorBoundary.tsx`
- `docs/screenshots/manual-qa/*.png`

No commit was created.
No push was performed.

## Follow-Up User Request

The user then asked:

> copy conversation นี้ลง folder C:\Users\wongs\interviews\bbl\transcripts ด้วย

This file was created to satisfy that request.
