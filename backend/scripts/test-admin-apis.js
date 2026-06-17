/**
 * ============================================================
 * Phase 2 - Admin API Test Suite
 * backend/scripts/test-admin-apis.js
 * ============================================================
 * Run with: node backend/scripts/test-admin-apis.js
 * Ensure the backend server is running on PORT 5000 before running.
 * ============================================================
 */

const http = require('http');

// ---- Config ----
const BASE_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'admin@store.com';
const ADMIN_PASSWORD = 'Admin@123';

// ---- Test Tracking ----
let passed = 0;
let failed = 0;
let adminToken = '';
let createdUserId = null;
let createdStoreId = null;

// ---- Colour helpers ----
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan  = (s) => `\x1b[36m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;
const dim   = (s) => `\x1b[2m${s}\x1b[0m`;

// ---- HTTP helper ----
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const payload = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ---- Test helper ----
function test(name, condition, actual = '') {
  if (condition) {
    console.log(`  ${green('✔')} ${name}`);
    passed++;
  } else {
    console.log(`  ${red('✘')} ${name}`);
    if (actual) console.log(`    ${dim('→ ' + JSON.stringify(actual))}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${bold(cyan('═══ ' + title + ' ═══'))}`);
}

// ---- Test Functions ----

async function testAdminLogin() {
  section('1. Admin Authentication');

  const res = await request('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });

  test('POST /auth/login → 200 OK', res.status === 200, res);
  test('Response has success: true', res.body?.success === true, res.body);
  test('Response contains JWT token', !!res.body?.data?.token, res.body?.data);
  test('User role is ADMIN', res.body?.data?.user?.role === 'ADMIN', res.body?.data?.user);

  if (res.body?.data?.token) {
    adminToken = res.body.data.token;
  }
}

async function testDashboardStats() {
  section('2. Admin Dashboard Stats');

  const res = await request('GET', '/admin/dashboard', null, adminToken);

  test('GET /admin/dashboard → 200 OK', res.status === 200, res);
  test('Response has success: true', res.body?.success === true, res.body);
  test('Stats has totalUsers field', typeof res.body?.data?.stats?.totalUsers !== 'undefined', res.body?.data?.stats);
  test('Stats has totalStores field', typeof res.body?.data?.stats?.totalStores !== 'undefined', res.body?.data?.stats);
  test('Stats has totalRatings field', typeof res.body?.data?.stats?.totalRatings !== 'undefined', res.body?.data?.stats);
  test('latestUsers is an array', Array.isArray(res.body?.data?.latestUsers), res.body?.data);
  test('latestStores is an array', Array.isArray(res.body?.data?.latestStores), res.body?.data);
}

async function testDashboardWithoutToken() {
  section('3. Security — Dashboard Without Token');

  const res = await request('GET', '/admin/dashboard', null, null);
  test('GET /admin/dashboard (no token) → 401', res.status === 401, res);

  const resInvalid = await request('GET', '/admin/dashboard', null, 'invalid.jwt.token');
  test('GET /admin/dashboard (invalid token) → 401', resInvalid.status === 401, resInvalid);
}

async function testGetUsers() {
  section('4. User Management — List Users');

  const res = await request('GET', '/admin/users?page=1&limit=10', null, adminToken);
  test('GET /admin/users → 200 OK', res.status === 200, res);
  test('Response data is an array', Array.isArray(res.body?.data), res.body);
  test('Pagination object present', !!res.body?.pagination, res.body);
  test('Pagination has total field', typeof res.body?.pagination?.total !== 'undefined', res.body?.pagination);

  // Search filter
  const resSearch = await request('GET', '/admin/users?search=admin&page=1&limit=10', null, adminToken);
  test('GET /admin/users?search=admin → 200 OK', resSearch.status === 200, resSearch);
  test('Search results count ≥ 1', (resSearch.body?.data?.length || 0) >= 1, resSearch.body?.data);

  // Role filter
  const resRole = await request('GET', '/admin/users?role=ADMIN&page=1&limit=10', null, adminToken);
  test('GET /admin/users?role=ADMIN → 200 OK', resRole.status === 200, resRole);
  test('All returned users have role ADMIN', (resRole.body?.data || []).every(u => u.role === 'ADMIN'), resRole.body?.data);
}

async function testCreateUser() {
  section('5. User Management — Create User');

  const payload = {
    name: 'Test Store Owner Account',   // 25 chars — meets 20-60 rule
    email: `testowner_${Date.now()}@test.com`,
    password: 'TestPass@1',
    role: 'STORE_OWNER'
  };

  const res = await request('POST', '/admin/users', payload, adminToken);
  test('POST /admin/users → 201 Created', res.status === 201, res);
  test('Response has success: true', res.body?.success === true, res.body);
  test('Created user has an id', !!res.body?.data?.id, res.body?.data);
  test('Created user role matches', res.body?.data?.role === 'STORE_OWNER', res.body?.data);

  if (res.body?.data?.id) createdUserId = res.body.data.id;

  // Validation — name too short
  const resShortName = await request('POST', '/admin/users', { ...payload, name: 'short' }, adminToken);
  test('Create user with short name → 422/400', [400, 422].includes(resShortName.status), resShortName);

  // Validation — duplicate email
  const resDuplicate = await request('POST', '/admin/users', { ...payload, email: ADMIN_EMAIL }, adminToken);
  test('Create user with duplicate email → 400', resDuplicate.status === 400, resDuplicate);
}

async function testGetUserById() {
  section('6. User Management — Get User by ID');

  if (!createdUserId) { console.log(dim('  (skipped — no created user)')); return; }

  const res = await request('GET', `/admin/users/${createdUserId}`, null, adminToken);
  test(`GET /admin/users/${createdUserId} → 200 OK`, res.status === 200, res);
  test('Returned user id matches', res.body?.data?.id === createdUserId, res.body?.data);
  test('store field is present in response', 'store' in (res.body?.data || {}), res.body?.data);

  const resNotFound = await request('GET', '/admin/users/999999', null, adminToken);
  test('GET /admin/users/999999 → 404', resNotFound.status === 404, resNotFound);
}

async function testUpdateUser() {
  section('7. User Management — Update User');

  if (!createdUserId) { console.log(dim('  (skipped — no created user)')); return; }

  const res = await request('PUT', `/admin/users/${createdUserId}`, {
    name: 'Updated Store Owner Name Here',  // 28 chars — valid
    email: `updated_${Date.now()}@test.com`,
    role: 'STORE_OWNER'
  }, adminToken);

  test(`PUT /admin/users/${createdUserId} → 200 OK`, res.status === 200, res);
  test('Updated name reflected in response', res.body?.data?.name === 'Updated Store Owner Name Here', res.body?.data);
}

async function testGetStores() {
  section('8. Store Management — List Stores');

  const res = await request('GET', '/admin/stores?page=1&limit=10', null, adminToken);
  test('GET /admin/stores → 200 OK', res.status === 200, res);
  test('Response data is an array', Array.isArray(res.body?.data), res.body);
  test('Pagination object present', !!res.body?.pagination, res.body);

  // Sorting
  const resSort = await request('GET', '/admin/stores?sortBy=name&sortOrder=ASC&page=1&limit=10', null, adminToken);
  test('GET /admin/stores?sortBy=name&sortOrder=ASC → 200 OK', resSort.status === 200, resSort);
}

async function testCreateStore() {
  section('9. Store Management — Create Store');

  const payload = {
    name: 'Automated Test Store Name Here',    // 30 chars — valid
    address: '123 Integration Test Avenue, Test City, TC 00000',
    owner_id: createdUserId || null
  };

  const res = await request('POST', '/admin/stores', payload, adminToken);
  test('POST /admin/stores → 201 Created', res.status === 201, res);
  test('Response has success: true', res.body?.success === true, res.body);
  test('Created store has an id', !!res.body?.data?.id, res.body?.data);
  test('Store name matches payload', res.body?.data?.name === payload.name, res.body?.data);

  if (res.body?.data?.id) createdStoreId = res.body.data.id;
}

async function testGetStoreById() {
  section('10. Store Management — Get Store by ID');

  if (!createdStoreId) { console.log(dim('  (skipped — no created store)')); return; }

  const res = await request('GET', `/admin/stores/${createdStoreId}`, null, adminToken);
  test(`GET /admin/stores/${createdStoreId} → 200 OK`, res.status === 200, res);
  test('Returned store id matches', res.body?.data?.id === createdStoreId, res.body?.data);
  test('average_rating field is present', typeof res.body?.data?.average_rating !== 'undefined', res.body?.data);
  test('ratings_distribution object is present', !!res.body?.data?.ratings_distribution, res.body?.data);
  test('owner field is present (null or object)', 'owner' in (res.body?.data || {}), res.body?.data);

  const resNotFound = await request('GET', '/admin/stores/999999', null, adminToken);
  test('GET /admin/stores/999999 → 404', resNotFound.status === 404, resNotFound);
}

async function testUpdateStore() {
  section('11. Store Management — Update Store');

  if (!createdStoreId) { console.log(dim('  (skipped — no created store)')); return; }

  const res = await request('PUT', `/admin/stores/${createdStoreId}`, {
    name: 'Updated Automated Test Store Name',   // 32 chars — valid
    address: '456 Updated Street, Test City, TC 11111',
    owner_id: createdUserId || null
  }, adminToken);

  test(`PUT /admin/stores/${createdStoreId} → 200 OK`, res.status === 200, res);
  test('Updated name reflected in response', res.body?.data?.name === 'Updated Automated Test Store Name', res.body?.data);
}

async function testCleanup() {
  section('12. Cleanup — Delete Created Fixtures');

  if (createdStoreId) {
    const resDel = await request('DELETE', `/admin/stores/${createdStoreId}`, null, adminToken);
    test(`DELETE /admin/stores/${createdStoreId} → 200 OK`, resDel.status === 200, resDel);
    test('Store deleted successfully message', resDel.body?.success === true, resDel.body);
  }

  if (createdUserId) {
    const resDel = await request('DELETE', `/admin/users/${createdUserId}`, null, adminToken);
    test(`DELETE /admin/users/${createdUserId} → 200 OK`, resDel.status === 200, resDel);
    test('User deleted successfully message', resDel.body?.success === true, resDel.body);
  }

  // Verify store is gone
  if (createdStoreId) {
    const resGone = await request('GET', `/admin/stores/${createdStoreId}`, null, adminToken);
    test('Deleted store returns 404', resGone.status === 404, resGone);
  }

  // Verify user is gone
  if (createdUserId) {
    const resGone = await request('GET', `/admin/users/${createdUserId}`, null, adminToken);
    test('Deleted user returns 404', resGone.status === 404, resGone);
  }
}

async function testRoleRestriction() {
  section('13. Security — Role Restriction (Non-Admin)');

  // Register a regular user
  const payload = {
    name: 'Regular User For Security Test',   // 30 chars — valid
    email: `regular_${Date.now()}@test.com`,
    password: 'TestPass@1'
  };

  const regRes = await request('POST', '/auth/register', payload);
  test('Register regular user → 201', regRes.status === 201, regRes);

  if (regRes.status !== 201) return;

  const loginRes = await request('POST', '/auth/login', {
    email: payload.email,
    password: payload.password
  });
  test('Login regular user → 200', loginRes.status === 200, loginRes);

  const userToken = loginRes.body?.data?.token;
  if (!userToken) return;

  // Attempt admin-only route with USER token
  const res = await request('GET', '/admin/dashboard', null, userToken);
  test('Regular user accessing /admin/dashboard → 403', res.status === 403, res);

  const resUsers = await request('GET', '/admin/users', null, userToken);
  test('Regular user accessing /admin/users → 403', resUsers.status === 403, resUsers);

  // Cleanup — admin deletes the test user
  if (loginRes.body?.data?.user?.id) {
    await request('DELETE', `/admin/users/${loginRes.body.data.user.id}`, null, adminToken);
  }
}

// ---- Main Runner ----
async function runAll() {
  console.log(bold('\n╔════════════════════════════════════════╗'));
  console.log(bold('║   Phase 2 Admin API Test Suite         ║'));
  console.log(bold('║   Store Rating Platform                ║'));
  console.log(bold('╚════════════════════════════════════════╝'));
  console.log(dim(`  Target: ${BASE_URL}`));
  console.log(dim(`  Started: ${new Date().toLocaleString()}\n`));

  try {
    await testAdminLogin();
    if (!adminToken) {
      console.log(red('\n  ✘ Admin login failed — aborting all further tests.\n'));
      process.exit(1);
    }
    await testDashboardStats();
    await testDashboardWithoutToken();
    await testGetUsers();
    await testCreateUser();
    await testGetUserById();
    await testUpdateUser();
    await testGetStores();
    await testCreateStore();
    await testGetStoreById();
    await testUpdateStore();
    await testCleanup();
    await testRoleRestriction();
  } catch (err) {
    console.error(red('\n  Fatal error during tests:'), err.message);
  }

  // ---- Summary ----
  const total = passed + failed;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log(bold('\n════════════════════════════════════════'));
  console.log(bold('  TEST SUMMARY'));
  console.log('════════════════════════════════════════');
  console.log(`  Total  : ${bold(total)}`);
  console.log(`  ${green('Passed')} : ${green(bold(passed))}`);
  console.log(`  ${red('Failed')} : ${red(bold(failed))}`);
  console.log(`  Score  : ${pct >= 90 ? green(pct + '%') : pct >= 70 ? `\x1b[33m${pct}%\x1b[0m` : red(pct + '%')}`);
  console.log('════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

runAll();
