const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'support_ticket_db',
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

const getSchemaSql = () => {
  const candidates = [
    path.join(__dirname, '..', 'database', 'schema.sql'),
    path.join(__dirname, '..', '..', 'database', 'schema.sql')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8');
    }
  }
  return '';
};

const getSeedSql = () => {
  const candidates = [
    path.join(__dirname, '..', 'database', 'seed.sql'),
    path.join(__dirname, '..', '..', 'database', 'seed.sql')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8');
    }
  }
  return '';
};

const autoInitDatabase = async () => {
  try {
    const [tables] = await pool.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      let schemaSql = getSchemaSql();
      if (schemaSql) {
        schemaSql = schemaSql.replace(/CREATE DATABASE[^\n;]*;/gi, '').replace(/USE [^\n;]*;/gi, '');
        await pool.query(schemaSql);
      }

      let seedSql = getSeedSql();
      if (seedSql) {
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
