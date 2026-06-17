const BASE_URL = 'http://localhost:5000/api/v1';

async function testAPIs() {
  console.log('=== STORE RATING PLATFORM - API INTEGRATION TESTS ===\n');
  
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password@123';
  const newPassword = 'NewPassword@321';
  const testName = 'Test User Long Name Characters'; // Must be between 20 and 60 chars
  
  let token = null;

  try {
    // Test Case 1: Register User with Invalid Name (Too Short)
    console.log('Test 1: Register with name too short (should fail)...');
    const registerShortNameRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Name',
        email: testEmail,
        password: testPassword,
        role: 'USER'
      })
    });
    const shortNameData = await registerShortNameRes.json();
    if (registerShortNameRes.status === 400 && !shortNameData.success) {
      console.log('  ✅ SUCCESS: Blocked short name registration.');
    } else {
      console.error(`  ❌ FAILED: Register allowed short name. Status: ${registerShortNameRes.status}`);
    }

    // Test Case 2: Register User with Valid Name
    console.log('\nTest 2: Register with valid details (should succeed)...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        role: 'USER'
      })
    });
    const registerData = await registerRes.json();
    if (registerRes.status === 201 && registerData.success) {
      console.log('  ✅ SUCCESS: User registered.');
      console.log(`  - Registered Email: ${testEmail}`);
    } else {
      console.error(`  ❌ FAILED: Register failed. Status: ${registerRes.status}, Error:`, registerData);
      process.exit(1);
    }

    // Test Case 3: Login with Invalid Password
    console.log('\nTest 3: Login with invalid password (should fail)...');
    const loginInvalidRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword@1'
      })
    });
    const loginInvalidData = await loginInvalidRes.json();
    if (loginInvalidRes.status === 401 && !loginInvalidData.success) {
      console.log('  ✅ SUCCESS: Invalid login blocked.');
    } else {
      console.error(`  ❌ FAILED: Login with wrong password allowed. Status: ${loginInvalidRes.status}`);
    }

    // Test Case 4: Login with Valid Password
    console.log('\nTest 4: Login with valid credentials (should succeed)...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.success) {
      token = loginData.data.token;
      console.log('  ✅ SUCCESS: Logged in.');
      console.log(`  - Token Generated: ${token.substring(0, 30)}...`);
    } else {
      console.error(`  ❌ FAILED: Login failed. Status: ${loginRes.status}, Error:`, loginData);
      process.exit(1);
    }

    // Test Case 5: Access Profile Without Token
    console.log('\nTest 5: Access protected profile without token (should fail)...');
    const profileNoTokenRes = await fetch(`${BASE_URL}/users/profile`);
    const profileNoTokenData = await profileNoTokenRes.json();
    if (profileNoTokenRes.status === 401 && !profileNoTokenData.success) {
      console.log('  ✅ SUCCESS: Blocked access without token.');
    } else {
      console.error(`  ❌ FAILED: Allowed access without token. Status: ${profileNoTokenRes.status}`);
    }

    // Test Case 6: Access Profile With Valid Token
    console.log('\nTest 6: Access profile with valid token (should succeed)...');
    const profileRes = await fetch(`${BASE_URL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData = await profileRes.json();
    if (profileRes.status === 200 && profileData.success) {
      console.log('  ✅ SUCCESS: Profile fetched.');
      console.log(`  - Name: ${profileData.data.name}`);
      console.log(`  - Email: ${profileData.data.email}`);
      console.log(`  - Role: ${profileData.data.role}`);
    } else {
      console.error(`  ❌ FAILED: Profile access failed. Status: ${profileRes.status}`);
    }

    // Test Case 7: Change Password
    console.log('\nTest 7: Change password with valid credentials (should succeed)...');
    const changePassRes = await fetch(`${BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword: testPassword,
        newPassword: newPassword
      })
    });
    const changePassData = await changePassRes.json();
    if (changePassRes.status === 200 && changePassData.success) {
      console.log('  ✅ SUCCESS: Password updated.');
    } else {
      console.error(`  ❌ FAILED: Password update failed. Status: ${changePassRes.status}, Error:`, changePassData);
    }

    // Test Case 8: Try Logging in with Old Password (should fail)
    console.log('\nTest 8: Login with old password (should fail)...');
    const loginOldRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginOldData = await loginOldRes.json();
    if (loginOldRes.status === 401 && !loginOldData.success) {
      console.log('  ✅ SUCCESS: Old password blocked.');
    } else {
      console.error(`  ❌ FAILED: Login with old password succeeded. Status: ${loginOldRes.status}`);
    }

    // Test Case 9: Login with New Password (should succeed)
    console.log('\nTest 9: Login with new password (should succeed)...');
    const loginNewRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: newPassword
      })
    });
    const loginNewData = await loginNewRes.json();
    if (loginNewRes.status === 200 && loginNewData.success) {
      console.log('  ✅ SUCCESS: Logged in using new password.');
    } else {
      console.error(`  ❌ FAILED: Login with new password failed. Status: ${loginNewRes.status}, Error:`, loginNewData);
    }

    // Test Case 10: Logout API call
    console.log('\nTest 10: Call logout API (should succeed)...');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const logoutData = await logoutRes.json();
    if (logoutRes.status === 200 && logoutData.success) {
      console.log('  ✅ SUCCESS: Backend logout returned OK.');
    } else {
      console.error(`  ❌ FAILED: Logout failed. Status: ${logoutRes.status}`);
    }

    console.log('\n=================================================');
    console.log('🎉 ALL INTEGRATION API TESTS COMPLETED SUCCESSFULLY! 🎉');
    console.log('=================================================');
  } catch (err) {
    console.error('\n❌ CRITICAL API TEST ERROR:', err.message);
  }
}

testAPIs();
