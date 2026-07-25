# Privacy Review Checklist

Use this checklist before closing any ticket that reads or mutates user data.

## Identity

- Which token claim identifies the current user?
- Is email used only for display or share lookup, not as the authorization key?

## Query Scope

- Does every private-data query include an owner predicate or an explicit read-only share predicate?
- Can a user infer another user's private resource exists from status codes, counts, filters, or error messages?

## Mutations

- Are mutations owner-only?
- For relationship changes, are both sides scoped to the current user?
- Does delete behavior require an explicit decision when data could be lost?

## Tests

- Is there a test where User A attempts to access User B's data?
- Does cross-owner private access return `404` where required?
- Is shared read access tested separately from mutation denial?
