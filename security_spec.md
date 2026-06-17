# Editorial Reviews Security Specification

## 1. Data Invariants
- An editorial review must have a valid `slug` which serves as its Document ID.
- The `status` must be one of: `draft`, `pending`, `approved`, `rejected`, `archived`.
- Public users (not signed in or non-admins) can ONLY read reviews where `status == 'approved'`.
- Only users with the `admin` role or the bootstrapped admin email can `create`, `update`, or `delete` reviews.
- `createdAt` is immutable after creation.
- `updatedAt` must be synced with `request.time`.

## 2. The "Dirty Dozen" Payloads (Anti-Patterns)
1. **Status Injection**: A public user tries to read a `draft` review.
2. **Identity Spoofing**: A non-admin user tries to create a review.
3. **Privilege Escalation**: A non-admin user tries to approve their own (or any) review.
4. **Invalid Status**: An admin tries to set status to `published` (no longer in enum).
5. **Shadow Fields**: An update payload includes a field not in the schema (e.g., `isVerified`).
6. **Orphaned Write**: Creating a review without a category.
7. **Bypass Rules**: A user tries to query all reviews without filtering by status `approved`.
8. **Resource Poisoning**: Providing a 1MB string for the `slug`.
9. **Null Poisoning**: Setting a required field like `title` to `null`.
10. **State Shortcutting**: Moving from `rejected` directly to `approved` without going through `pending`? (Wait, admins can do anything, but let's see).
11. **Timestamp Manipulation**: Providing a future `createdAt` date.
12. **Malicious Clicks**: A public user tries to update the `views` or `clicks` field directly (this uses server-side increment or restricted update). Actually, current code allows `update` only for admins.

## 3. Test Runner (Conceptual)
All "Dirty Dozen" payloads must return `PERMISSION_DENIED`.

- `read` /editorial_reviews/123 where status == 'draft' (Public) -> DENIED
- `create` /editorial_reviews/new-review (Public) -> DENIED
- `update` /editorial_reviews/slug { status: 'approved' } (Public) -> DENIED
- `update` /editorial_reviews/slug { status: 'invalid' } (Admin) -> DENIED (via validation helper)
- `update` /editorial_reviews/slug { ghostField: true } (Admin) -> DENIED (via hasOnly)
