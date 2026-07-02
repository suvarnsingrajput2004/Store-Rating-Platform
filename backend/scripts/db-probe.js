**
 * db - probe.js  —  Tests MySQL connection using.env credentials
  * Run: node scripts / db - probe.js
    */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function probe() {
  const cfg = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '3306')
  };

  console.log('\n  DB_HOST    :', cfg.host);
  console.log('  DB_USER    :', cfg.user);
  console.log('  DB_PASSWORD:', cfg.password ? '***' + cfg.password.slice(-3) : '(empty)');
  console.log('  DB_PORT    :', cfg.port);
  console.log('  DB_NAME    :', process.env.DB_NAME, '\n');

  let conn;
  try {
    conn = await mysql.createConnection(cfg);
    console.log('  ✔ Connected to MySQL successfully!\n');

    // List existing store_rating* databases
    const [rows] = await conn.execute("SHOW DATABASES LIKE 'store_rating%'");
    if (rows.length === 0) {
      console.log("  ℹ No database named 'store_rating*' found yet.");
      console.log("  → Run the schema.sql file to create and populate the database.\n");
    } else {
      console.log('  Existing databases:');
      rows.forEach(r => console.log('    •', Object.values(r)[0]));
      console.log('');
    }

    // Try connecting to the target DB
    const dbCfg = { ...cfg, database: process.env.DB_NAME };
    let dbConn;
    try {
      dbConn = await mysql.createConnection(dbCfg);
      console.log(`  ✔ Database '${process.env.DB_NAME}' is accessible.\n`);
      // Check tables
      const [tables] = await dbConn.execute('SHOW TABLES');
      if (tables.length === 0) {
        console.log("  ℹ Database exists but has no tables. Run schema.sql to set up tables.\n");
      } else {
        console.log('  Tables found:');
        tables.forEach(t => console.log('    •', Object.values(t)[0]));
        // Check admin user
        const [admins] = await dbConn.execute("SELECT id, name, email, role FROM Users WHERE email='admin@store.com'");
        console.log(admins.length > 0
          ? `\n  ✔ Admin seed user exists: ${admins[0].email}`
          : "\n  ✘ Admin seed user NOT found. Re-run schema.sql seed INSERT.");
      }
      await dbConn.end();
    } catch (dbErr) {
      console.log(`  ✘ Database '${process.env.DB_NAME}' not accessible: ${dbErr.message}`);
      console.log("  → Create the database first by running:\n");
      console.log(`      mysql -u ${cfg.user} -p < database/schema.sql\n`);
    }

    await conn.end();
  } catch (err) {
    console.error('\n  ✘ MySQL connection FAILED:', err.message);
    console.error('\n  Check your .env credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_PORT).\n');
    process.exit(1);
  }
}

probe();
