const db = require('../config/db');

async function runVerification() {
  console.log('=== STORE RATING PLATFORM - DATABASE VERIFICATION ===\n');
  let connection;
  try {
    connection = await db.getConnection();
    console.log('✅ Connection Test: SUCCESS (Successfully connected to the database pool)');

    // 1. Check if database exists and tables are present
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log(`📋 Found Tables: ${tableNames.join(', ') || 'None'}`);

    const requiredTables = ['Users', 'Stores', 'Ratings'];
    let allTablesExist = true;
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`  ✅ Table '${table}': FOUND`);
      } else {
        console.error(`  ❌ Table '${table}': MISSING`);
        allTablesExist = false;
      }
    }

    if (!allTablesExist) {
      console.log('\n❌ Verification failed due to missing tables. Please run schema.sql first.');
      connection.release();
      process.exit(1);
    }

    // 2. Verify Users Table Columns and Constraints
    const [userColumns] = await connection.query('DESCRIBE Users');
    console.log('\n👥 Users Table Columns:');
    userColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) - Null: ${col.Null}, Key: ${col.Key}, Default: ${col.Default}`);
    });

    // Check for created_at and updated_at
    const userFieldNames = userColumns.map(c => c.Field);
    if (userFieldNames.includes('created_at') && userFieldNames.includes('updated_at')) {
      console.log('  ✅ Timestamp columns (created_at, updated_at): PRESENT');
    } else {
      console.error('  ❌ Timestamp columns (created_at, updated_at): MISSING');
    }

    // 3. Verify admin seed
    const [admins] = await connection.query("SELECT id, name, email, role FROM Users WHERE email = 'admin@store.com'");
    if (admins.length > 0) {
      console.log(`\n👑 Admin Seed Verification: SUCCESS`);
      console.log(`  - ID: ${admins[0].id}`);
      console.log(`  - Name: ${admins[0].name}`);
      console.log(`  - Email: ${admins[0].email}`);
      console.log(`  - Role: ${admins[0].role}`);
    } else {
      console.error(`\n❌ Admin Seed Verification: FAILED (Admin user 'admin@store.com' not found)`);
    }

    // 4. Verify unique constraint and foreign keys in Ratings table
    const [ratingKeys] = await connection.query("SHOW KEYS FROM Ratings WHERE Key_name = 'uq_user_store'");
    if (ratingKeys.length > 0) {
      console.log('\n🔐 Ratings Unique Constraint (user_id, store_id): VERIFIED');
    } else {
      console.error('\n❌ Ratings Unique Constraint (user_id, store_id): MISSING uq_user_store key');
    }

    // Test unique constraint with a transaction (rollback after test)
    console.log('\n🛡️  Constraint Enforcement Test:');
    await connection.beginTransaction();
    try {
      // Create a dummy user
      const [userResult] = await connection.query(
        "INSERT INTO Users (name, email, password, role) VALUES ('Dummy Verification User', 'dummy@test.com', 'dummy_hash', 'USER')"
      );
      const dummyUserId = userResult.insertId;

      // Create a dummy store
      const [storeResult] = await connection.query(
        "INSERT INTO Stores (name, address, owner_id) VALUES ('Dummy Verification Store', '123 Test Street', NULL)"
      );
      const dummyStoreId = storeResult.insertId;

      // First rating insert
      await connection.query(
        "INSERT INTO Ratings (store_id, user_id, rating) VALUES (?, ?, 5)",
        [dummyStoreId, dummyUserId]
      );
      console.log('  ✅ First rating submission: SUCCESS');

      // Second rating insert (should fail)
      try {
        await connection.query(
          "INSERT INTO Ratings (store_id, user_id, rating) VALUES (?, ?, 4)",
          [dummyStoreId, dummyUserId]
        );
        console.error('  ❌ Duplicate rating submission: Bypassed constraint! (FAILED)');
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) {
          console.log('  ✅ Duplicate rating submission: BLOCKED (SUCCESS - UNIQUE constraint triggered)');
        } else {
          console.error('  ❌ Duplicate rating submission: Failed with unexpected error:', err.message);
        }
      }
    } catch (testError) {
      console.error('  ❌ Error during constraint test:', testError.message);
    } finally {
      // Rollback transaction to keep DB clean
      await connection.rollback();
      console.log('  🧹 Cleanup transaction: ROLLED BACK');
    }

  } catch (err) {
    console.error('❌ Connection/Query Error:', err.message);
  } finally {
    if (connection) connection.release();
    console.log('\n=== Database Verification Done ===');
    process.exit(0);
  }
}

runVerification();
