/**
 * Database Configuration & Connection Pool
 * Uses node-postgres (pg) pool to communicate with PostgreSQL (pgAdmin).
 */

const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false'
        ? false
        : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'electricity_billing_db',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Helper for single parameterized queries
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // Uncomment below for verbose SQL profiling in development
  // console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

// Helper for transactions
const getClient = async () => {
  return await pool.connect();
};

// Test connection on boot
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT current_database(), current_user, version()');
    console.log(` Database connected successfully to '${res.rows[0].current_database}' as '${res.rows[0].current_user}'`);
    return true;
  } catch (err) {
    console.error(' Database connection failed:', err.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};
