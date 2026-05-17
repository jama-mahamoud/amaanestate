# Security Specification for AmaanEstate

## Data Invariants
1. A user profile must correctly reflect the authenticated user's ID and email.
2. The `role` field is immutable for the user and defaults to `buyer`.
3. `createdAt` is immutable.
4. Users can only edit their own `displayName` and `photoURL`.
5. Global deny by default for all other collections/documents.

## The "Dirty Dozen" Payloads (Users Collection)

1. **Identity Spoofing**: Create a profile with `uid` that doesn't match `request.auth.uid`.
2. **Email Hijacking**: Create a profile with an email that doesn't match `request.auth.token.email`.
3. **Privilege Escalation (Create)**: Create a profile with `role: 'admin'`.
4. **Privilege Escalation (Update)**: Update existing profile and change `role` to `admin`.
5. **Timestamp Manipulation**: Set `createdAt` to a future or past date (not `request.time`).
6. **Orphaned Profile**: Create a profile for a `uid` that isn't the caller.
7. **Cross-User Edit**: Attempt to update another user's profile.
8. **Shadow Fields**: Add an unauthorized field like `isVip: true` during update.
9. **Role Injection**: Change `role` during a standard profile update.
10. **Immortality Breach**: Change `createdAt` during update.
11. **Malicious Strings**: Inject a 1MB string into `displayName`.
12. **Unauthenticated Write**: Attempt to create a profile without being signed in.

## Test Results
All "Dirty Dozen" payloads should return `PERMISSION_DENIED`.
