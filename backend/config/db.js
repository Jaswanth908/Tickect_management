const mysql = require('mysql2/promise');
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
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper function to test DB connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(` MySQL Database Connected Successfully to "${process.env.DB_NAME || 'support_ticket_db'}"`);
    connection.release();
    return true;
  } catch (error) {
    console.warn(`[DB WARNING] Could not connect to MySQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
    console.warn(`Error details: ${error.message}`);
    console.warn('Ensure MySQL is running and credentials in .env are correct.');
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
