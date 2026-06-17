/**
 * setup-database.js — Creates DB and runs schema
 * Run: node scripts/setup-database.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

async function setup() {
  const baseCfg = {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port:     parseInt(process.env.DB_PORT || '3306')
  };

  const dbName     = process.env.DB_NAME;
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');

  console.log(`\n  ═══════════════════════════════════════`);
  console.log(`   Store Rating Platform — DB Setup`);
  console.log(`  ═══════════════════════════════════════`);
  console.log(`  Target DB : ${dbName}`);
  console.log(`  Host      : ${baseCfg.host}:${baseCfg.port}`);
  console.log(`  Schema    : ${schemaPath}\n`);

  if (!fs.existsSync(schemaPath)) {
    console.error(`  ✘ schema.sql not found.\n`);
    process.exit(1);
  }

  // ── Step 1: Connect without DB and create it ─────────────────────────
  let conn;
  try {
    conn = await mysql.createConnection(baseCfg);
    console.log('  ✔ Connected to MySQL server');
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`  ✔ Database '${dbName}' ready`);
    await conn.end();
  } catch (err) {
    console.error('  ✘ Failed to create database:', err.message);
    process.exit(1);
  }

  // ── Step 2: Connect WITH the DB and run DDL/seed directly ────────────
  const dbCfg = { ...baseCfg, database: dbName };
  try {
    conn = await mysql.createConnection(dbCfg);
    console.log(`  ✔ Using database '${dbName}'\n`);

    // Define all DDL and seed statements explicitly
    const statements = [
      // Users table
      `CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Stores table
      `CREATE TABLE IF NOT EXISTS Stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(400) NOT NULL,
        owner_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE SET NULL,
        INDEX idx_stores_owner_id (owner_id),
        INDEX idx_stores_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Ratings table
      `CREATE TABLE IF NOT EXISTS Ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_id INT NOT NULL,
        user_id INT NOT NULL,
        rating TINYINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (store_id) REFERENCES Stores(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_store (user_id, store_id),
        INDEX idx_ratings_store_id (store_id),
        INDEX idx_ratings_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Seed admin user (bcrypt hash of 'Admin@123')
      `INSERT IGNORE INTO Users (name, email, password, role) VALUES (
        'System Administrator',
        'admin@store.com',
        '$2a$10$tZ2rP0f1p1U85xN.2N0y/.29pE.zG6bJd7B9gI2q67sEwWq6k.xLu',
        'ADMIN'
      )`
    ];

    for (const stmt of statements) {
      try {
        await conn.query(stmt);
        const preview = stmt.replace(/\s+/g, ' ').trim().slice(0, 70);
        console.log(`  ✔ ${preview}…`);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`  ℹ Table already exists — skipped`);
        } else if (err.code === 'ER_DUP_ENTRY') {
          console.log(`  ℹ Admin user already exists — skipped`);
        } else {
          console.warn(`  ⚠ ${err.message}`);
        }
      }
    }

    // ── Step 3: Verify ──────────────────────────────────────────────────
    console.log('\n  ─── Verification ───────────────────────');
    const [tables] = await conn.query('SHOW TABLES');
    console.log('  Tables created:');
    tables.forEach(t => console.log('    •', Object.values(t)[0]));

    const [admins] = await conn.query(
      "SELECT id, name, email, role FROM Users WHERE email = 'admin@store.com'"
    );
    if (admins.length > 0) {
      console.log(`\n  ✔ Admin seed user:`);
      console.log(`    Email    : ${admins[0].email}`);
      console.log(`    Password : Admin@123`);
      console.log(`    Role     : ${admins[0].role}`);
    } else {
      console.log('\n  ✘ Admin seed user NOT found');
    }

    await conn.end();
    console.log('\n  ✔ Database setup COMPLETE!\n');
    console.log('  ─── Next Steps ─────────────────────────');
    console.log('  1. Start backend:  cd backend && node server.js');
    console.log('  2. Run API tests:  node scripts/test-admin-apis.js');
    console.log('  3. Start frontend: cd frontend && npm run dev\n');

  } catch (err) {
    console.error('  ✘ Schema execution failed:', err.message);
    if (conn) await conn.end().catch(() => {});
    process.exit(1);
  }
}

setup();
