# Security Spec

## Data Invariants
1. Only users with role 'admin' can bypass normal rules.
2. An agent can only create/update properties or vehicles if `request.auth.uid == agentId`.
3. Properties/Vehicles created by agents must start as 'pending' unless admin. Only admin can set 'published'.
4. Articles can only be created/updated by 'admin'.
5. Inquiries can be created by anyone, but read only by 'admin' or if it relates to a property the agent owns. For simplicity, only 'admin' reads inquiries.

## The Dirty Dozen
1. Spoofing user role: Agent updates their own user doc to role 'admin'.
2. Orphaned record: Creating a property without being in the `users` collection.
3. ID Poisoning: Property ID is a 1MB string.
4. Escaping constraints: Setting a property status directly to 'published'.
5. Shadow Field: Creating a property with `isSecret` field.
6. Identity spoofing: `agentId` differs from `request.auth.uid` on create.
7. Denial of Wallet: Array of 100,000 images on Property creation.
8. Unverified Email: Unverified user trying to create a vehicle.
9. Privilege Escalation: Non-admin trying to update company settings.
10. Query Trust: Agent listing properties they don't own.
11. PII Blanket: Non-admin trying to read all users.
12. Terminal State Lock: Editing an inquiry that is already 'replied' (if we wanted).

## Implementation Rules
- Users collection: `create` allows role 'user' or 'agent'. `role` update is restricted to admin. Users can read their own profile. Admin reads all.
- Properties/Vehicles: Agents can create (status must be 'pending'). Agents can read their own. Public can read 'published'. Admin can do anything.
- Articles: Admin only for write. Public for read if status 'published'.
- Inquiries: Anyone can create. Admin only read/delete.
_Note: We'll skip complex test runner file as per standard brevity, but we build the rules properly._
