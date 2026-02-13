const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

pool.on('connect', () => {
  console.log('New PostgreSQL client connected');
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn('Slow query detected:', { text, duration, rows: result.rowCount });
  }
  return result;
}

async function getClient() {
  const client = await pool.connect();
  const originalRelease = client.release.bind(client);
  client.release = () => {
    originalRelease();
  };
  return client;
}

async function healthCheck() {
  try {
    const result = await pool.query('SELECT NOW()');
    return { healthy: true, timestamp: result.rows[0].now };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

module.exports = {
  pool,
  query,
  getClient,
  healthCheck,
};
