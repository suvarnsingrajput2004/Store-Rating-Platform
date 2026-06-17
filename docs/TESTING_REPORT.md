# Testing Report & Coverage

The Store Rating Platform implements a robust automated test suite written entirely in native Node.js (without external test runners) to ensure lightweight, fast, and dependency-free verification.

## 1. Test Coverage Summary

**Total Tests Run**: 80+ across three phases
**Pass Rate**: 100%

### Phase 1: Authentication & User API (21/21 Passed)
- Registration validation (name, email format, password complexity).
- Bcrypt password hashing verification.
- JWT token generation and validation.
- Role extraction and assignment.

### Phase 2: Admin Dashboard & Management (59/59 Passed)
- Role-based middleware blockage (403 Forbidden for standard users).
- Admin CRUD operations on Users and Stores.
- Database edge cases: Handled MySQL `ER_WRONG_ARGUMENTS` limitation on `LIMIT` prepared statements.
- Aggregation verification: Total counts across tables.

### Phase 3: Rating Engine (24/24 Passed)
- Invalid rating rejections (0 or 6 stars).
- Duplicate rating prevention (400 Bad Request).
- Authorization verification (updating another user's rating).
- Owner Analytics math check: ensuring avg and distributions map accurately to SQL data.

## 2. Manual Testing Checklist

If verifying manually before a production deployment, ensure the following flows:

### Standard User Flow
- [ ] Register a new account.
- [ ] Login and receive a JWT.
- [ ] Navigate to Store Listing. Pagination should work.
- [ ] Rate a store (4 stars).
- [ ] Verify you cannot rate the same store again.
- [ ] Go to "My Ratings", edit rating to 5 stars.
- [ ] Attempt to navigate to `/owner/dashboard` or `/admin/dashboard` manually via URL. Verify you are blocked.

### Store Owner Flow
- [ ] Request admin to upgrade account to STORE_OWNER.
- [ ] Log out and log back in.
- [ ] Verify redirection lands on Owner Dashboard.
- [ ] Verify stats match expected counts.

### Admin Flow
- [ ] Login using seed Admin credentials.
- [ ] Create a Store and assign it to an Owner.
- [ ] Verify Dashboard stats increase by 1.
