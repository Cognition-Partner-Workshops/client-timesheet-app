const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  connectTimeout: 5000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on('connection', () => {
  console.log('New MySQL connection established');
});

async function query(sql, params) {
  const start = Date.now();
  const [rows] = await pool.execute(sql, params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn('Slow query detected:', { sql, duration });
  }
  return rows;
}

async function getConnection() {
  return pool.getConnection();
}

async function healthCheck() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now');
    return { healthy: true, timestamp: rows[0].now };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  healthCheck,
};
