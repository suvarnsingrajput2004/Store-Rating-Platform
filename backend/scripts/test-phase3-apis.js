/**
 * ============================================================
 * Phase 3 - Ratings and Owner Dashboard API Test Suite
 * backend/scripts/test-phase3-apis.js
 * ============================================================
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

let passed = 0;
let failed = 0;

let userToken = '';
let ownerToken = '';
let adminToken = '';
let userId = null;
let ownerId = null;
let storeId = null;
let ratingId = null;

// ---- Colour helpers ----
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red   = (s) => `\x1b[31m${s}\x1b[0m`;
const cyan  = (s) => `\x1b[36m${s}\x1b[0m`;
const bold  = (s) => `\x1b[1m${s}\x1b[0m`;
const dim   = (s) => `\x1b[2m${s}\x1b[0m`;

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

async function setupUsersAndStore() {
  section('0. Setup Fixtures');

  // Login as admin first
  const adminRes = await request('POST', '/auth/login', { email: 'admin@store.com', password: 'Admin@123' });
  adminToken = adminRes.body?.data?.token;
  if (!adminToken) throw new Error('Admin login failed');

  // Create Store Owner
  const ownerRes = await request('POST', '/admin/users', {
    name: 'Test Store Owner User',
    email: `owner_${Date.now()}@test.com`,
    password: 'TestPass@1',
    role: 'STORE_OWNER'
  }, adminToken);
  ownerId = ownerRes.body?.data?.id;

  const oLogin = await request('POST', '/auth/login', { email: ownerRes.body.data.email, password: 'TestPass@1' });
  ownerToken = oLogin.body?.data?.token;

  // Create Store
  const storeRes = await request('POST', '/admin/stores', {
    name: 'Phase 3 Test Store Name',
    address: '123 Rating Avenue',
    owner_id: ownerId
  }, adminToken);
  storeId = storeRes.body?.data?.id;

  // Create Standard User
  const userRes = await request('POST', '/admin/users', {
    name: 'Standard Rating User',
    email: `user_${Date.now()}@test.com`,
    password: 'TestPass@1',
    role: 'USER'
  }, adminToken);
  userId = userRes.body?.data?.id;

  const uLogin = await request('POST', '/auth/login', { email: userRes.body.data.email, password: 'TestPass@1' });
  userToken = uLogin.body?.data?.token;

  test('Fixtures created successfully', !!(ownerId && storeId && userId && userToken && ownerToken));
}

async function testSubmitRating() {
  section('1. Submit Rating (USER)');

  // Invalid rating value
  const invalidRes = await request('POST', '/ratings', { store_id: storeId, rating: 6 }, userToken);
  test('POST /ratings with invalid rating -> 400', invalidRes.status === 400, invalidRes);

  // Valid rating
  const validRes = await request('POST', '/ratings', { store_id: storeId, rating: 4 }, userToken);
  test('POST /ratings with valid rating -> 201', validRes.status === 201, validRes);
  ratingId = validRes.body?.data?.id;

  // Duplicate rating
  const dupRes = await request('POST', '/ratings', { store_id: storeId, rating: 5 }, userToken);
  test('POST /ratings with duplicate -> 400', dupRes.status === 400, dupRes);
}

async function testUpdateRating() {
  section('2. Update Rating (USER)');

  const upRes = await request('PUT', `/ratings/${ratingId}`, { rating: 5 }, userToken);
  test('PUT /ratings/:id -> 200', upRes.status === 200, upRes);
  test('Rating updated to 5', upRes.body?.data?.rating === 5, upRes.body?.data);

  // Unauthorised update (using owner token)
  const unauthRes = await request('PUT', `/ratings/${ratingId}`, { rating: 1 }, ownerToken);
  test('PUT /ratings/:id with wrong role -> 403', unauthRes.status === 403, unauthRes);
}

async function testMyRatings() {
  section('3. Get My Ratings (USER)');

  const res = await request('GET', '/users/my-ratings', null, userToken);
  test('GET /users/my-ratings -> 200', res.status === 200, res);
  test('Returns array of ratings', Array.isArray(res.body?.data), res.body);
  test('Rating includes store_name', !!res.body?.data[0]?.store_name, res.body?.data[0]);
}

async function testStoreListing() {
  section('4. Store Listing (USER)');

  const res = await request('GET', `/stores?search=Phase 3`, null, userToken);
  test('GET /stores -> 200', res.status === 200, res);
  
  const store = res.body?.data?.find(s => s.id === storeId);
  test('Store includes my_rating', typeof store?.my_rating !== 'undefined', store);
  test('Store my_rating matches updated value', store?.my_rating === 5, store);
  test('Store average_rating is accurate', store?.average_rating === 5, store);
}

async function testOwnerDashboard() {
  section('5. Store Owner Dashboard');

  // User access block
  const unauthRes = await request('GET', '/owner/dashboard', null, userToken);
  test('USER role access dashboard -> 403', unauthRes.status === 403, unauthRes);

  // Valid access
  const res = await request('GET', '/owner/dashboard', null, ownerToken);
  test('GET /owner/dashboard -> 200', res.status === 200, res);
  
  const data = res.body?.data;
  test('Dashboard returns store details', !!data?.store, data);
  test('Dashboard returns recent raters', !!data?.recent_ratings, data);
  
  const store = data?.store;
  test('Store has total_ratings = 1', store?.total_ratings === 1, store);
  test('Store has average_rating = 5', store?.average_rating === 5, store);
  test('Store has highest_rating_count = 1', store?.highest_rating_count === 1, store);
  test('Store has rating distribution object', !!store?.ratings_distribution, store);
  test('Rating distribution 5 star = 1', store?.ratings_distribution['5'] === 1, store?.ratings_distribution);
}

async function testCleanup() {
  section('6. Cleanup Fixtures');

  if (storeId) await request('DELETE', `/admin/stores/${storeId}`, null, adminToken);
  if (userId) await request('DELETE', `/admin/users/${userId}`, null, adminToken);
  if (ownerId) await request('DELETE', `/admin/users/${ownerId}`, null, adminToken);
  
  test('Cleanup successful', true);
}

async function runAll() {
  try {
    await setupUsersAndStore();
    if (!storeId || !userId) {
      console.log(red('Failed to setup test fixtures. Aborting.'));
      process.exit(1);
    }

    await testSubmitRating();
    await testUpdateRating();
    await testMyRatings();
    await testStoreListing();
    await testOwnerDashboard();
    
    await testCleanup();
  } catch(err) {
    console.error('Fatal error', err);
  }

  const total = passed + failed;
  const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  console.log(bold('\n════════════════════════════════════════'));
  console.log(bold('  TEST SUMMARY'));
  console.log('════════════════════════════════════════');
  console.log(`  Total  : ${bold(total)}`);
  console.log(`  ${green('Passed')} : ${green(bold(passed))}`);
  console.log(`  ${red('Failed')} : ${red(bold(failed))}`);
  console.log(`  Score  : ${pct >= 90 ? green(pct + '%') : pct >= 70 ? '\x1b[33m' + pct + '%\x1b[0m' : red(pct + '%')}`);
  console.log('════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

runAll();
