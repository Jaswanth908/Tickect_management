const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

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
  keepAliveInitialDelay: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

const autoInitDatabase = async () => {
  try {
    const [tables] = await pool.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
      const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');

      if (fs.existsSync(schemaPath)) {
        let schemaSql = fs.readFileSync(schemaPath, 'utf8');
        schemaSql = schemaSql.replace(/CREATE DATABASE[^\n;]*;/gi, '').replace(/USE [^\n;]*;/gi, '');
        await pool.query(schemaSql);
      }

      if (fs.existsSync(seedPath)) {
        let seedSql = fs.readFileSync(seedPath, 'utf8');
        seedSql = seedSql.replace(/USE [^\n;]*;/gi, '');
        await pool.query(seedSql);
      }
    }
  } catch (err) {
    console.warn(err.message);
  }
};

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    await autoInitDatabase();
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
