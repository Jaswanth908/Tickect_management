const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool for MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'support_ticket_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Auto-initialize database schema and seeds if not already created
 */
const autoInitDatabase = async () => {
  try {
    const [tables] = await pool.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.log('📦 Database tables not found. Automatically initializing schema & seed data...');
      
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Database schema initialized.');
      }

      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await pool.query(seedSql);
        console.log('✅ Seed data inserted.');
      }
    }
  } catch (err) {
    console.warn('⚠️ Auto-initialization check:', err.message);
  }
};

/**
 * Test DB connection and run autoInit on startup
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Database Connected Successfully to "${process.env.DB_NAME || 'support_ticket_db'}"`);
    connection.release();

    // Auto-init schema if empty
    await autoInitDatabase();
    return true;
  } catch (error) {
    console.warn(`[DB WARNING] Could not connect to MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
    console.warn(`Error details: ${error.message}`);
    console.warn('Ensure MySQL is running and DB_PASSWORD in backend/.env is correct.');
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
