/**
 * find-mysql-password.js  —  Tries common passwords to find the correct MySQL root password
 * Run: node scripts/find-mysql-password.js
 */
const mysql = require('mysql2/promise');

const HOST = 'localhost';
const PORT = 3306;
const USER = 'root';

const PASSWORDS_TO_TRY = [
  '',                        // no password
  'root',                    // common default
  'root123',                 // user mentioned this
  'password',
  'mysql',
  '8767163102',              // numeric part of what was provided
  '8767163102@#@#',          // full provided password
  'Root@123',
  'admin',
  'toor'
];

async function tryPassword(pwd) {
  try {
    const conn = await mysql.createConnection({
      host: HOST, user: USER, password: pwd, port: PORT,
      connectTimeout: 3000
    });
    await conn.end();
    return true;
  } catch {
    return false;
  }
}

async function findPassword() {
  console.log('\n  Trying MySQL root passwords...\n');
  for (const pwd of PASSWORDS_TO_TRY) {
    const ok = await tryPassword(pwd);
    const display = pwd === '' ? '(empty)' : `"${pwd}"`;
    if (ok) {
      console.log(`  ✔ SUCCESS — Password is: ${display}`);
      console.log(`\n  Update your .env:\n    DB_PASSWORD=${pwd}\n`);
      process.exit(0);
    } else {
      console.log(`  ✘ Failed  — ${display}`);
    }
  }
  console.log('\n  None of the common passwords worked.');
  console.log('  Please open MySQL Workbench or run: mysql -u root -p');
  console.log('  and enter your password manually to confirm it.\n');
  process.exit(1);
}

findPassword();
