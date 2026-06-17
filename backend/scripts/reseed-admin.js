/**
 * reseed-admin.js — Updates the admin seed user with a freshly generated password hash
 * Run: node scripts/reseed-admin.js
 */
require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function reseed() {
  const cfg = {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port:     parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME
  };

  const ADMIN_EMAIL    = 'admin@store.com';
  const ADMIN_PASSWORD = 'Admin@123';
  const ADMIN_NAME     = 'System Administrator';

  console.log('\n  Re-seeding admin user...');

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  console.log(`  ✔ Generated hash for '${ADMIN_PASSWORD}'`);

  const conn = await mysql.createConnection(cfg);

  // Delete existing admin (if any) and re-insert with correct hash
  await conn.query("DELETE FROM Users WHERE email = ?", [ADMIN_EMAIL]);
  await conn.query(
    "INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, 'ADMIN')",
    [ADMIN_NAME, ADMIN_EMAIL, hash]
  );

  const [rows] = await conn.query(
    "SELECT id, name, email, role FROM Users WHERE email = ?",
    [ADMIN_EMAIL]
  );

  await conn.end();

  console.log(`  ✔ Admin user seeded successfully:`);
  console.log(`    ID       : ${rows[0].id}`);
  console.log(`    Name     : ${rows[0].name}`);
  console.log(`    Email    : ${rows[0].email}`);
  console.log(`    Role     : ${rows[0].role}`);
  console.log(`    Password : ${ADMIN_PASSWORD}`);

  // Quick verify — bcrypt compare
  const ok = await bcrypt.compare(ADMIN_PASSWORD, hash);
  console.log(`  ✔ Password verify: ${ok ? 'PASS' : 'FAIL'}\n`);
}

reseed().catch(err => {
  console.error('  ✘ Reseed failed:', err.message);
  process.exit(1);
});
