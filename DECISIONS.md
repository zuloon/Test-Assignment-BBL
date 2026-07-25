# Decisions

## D1. Backend Bearer Credential

Decision: the backend accepts Auth0 access tokens as Bearer credentials and rejects ID tokens as API credentials.

Rationale: access tokens are issued to authorize API calls and can carry the API audience `https://bbl-candidate-test-api`. ID tokens identify the signed-in user to the client and are not the right credential for API authorization.

Trade-off: this requires the frontend to request the configured API audience during login. In return, backend validation has a clear issuer/audience contract.

## D2. User Identity

Decision: store Auth0 `sub` as the canonical user id and resource `ownerId`.

Rationale: `sub` is the stable subject identifier from the issuer. Email is useful for display and sharing workflows, but can change and should not be the authorization key.

## D3. Private Resource Existence

Decision: private resources owned by another user return `404 Not Found`, not `403 Forbidden`.

Rationale: the product invariant says users must not even learn that another user's private data exists. Returning `404` avoids confirming resource existence.

## D4. Collection Deletion

Decision: deleting a collection containing bookmarks requires an explicit action: `uncategorize`, `move`, or `delete`.

Rationale: silently deleting bookmarks is surprising, while always preserving them may not match the user's intent. The UI should ask the user and the API should reject ambiguous deletion with `409 Conflict`.

## D5. Sharing Scope

Decision: implement read-only collection sharing.

Rationale: the spec says a user may want to share a collection, but the central security property is privacy. Read-only sharing satisfies the product need while keeping the mutation surface small and testable.

Trade-off: collaborators cannot edit shared collections or bookmarks in this version. This can be extended later with explicit roles and permissions.

## D6. SQL Provider

Decision: use SQLite with Prisma for the take-home submission unless a later Docker/Postgres bonus is added.

Rationale: SQLite satisfies SQL persistence, is easy for reviewers to run locally, and avoids adding infrastructure that does not directly improve the core grading criteria.

