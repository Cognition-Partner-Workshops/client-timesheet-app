const { Pool } = require('pg');

let pool = null;

function getPoolConfig() {
  const config = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'timesheet',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    max: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '5000', 10),
  };

  if (process.env.DATABASE_SSL === 'true') {
    config.ssl = {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false'
    };
  }

  return config;
}

function getDatabase() {
  if (!pool) {
    const config = getPoolConfig();
    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    pool.on('connect', () => {
      console.log('New client connected to PostgreSQL pool');
    });

    console.log(`PostgreSQL pool created (host: ${config.host}, database: ${config.database})`);
  }
  return pool;
}

async function initializeDatabase() {
  const db = getDatabase();

  try {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createClientsTable = `
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createWorkEntriesTable = `
      CREATE TABLE IF NOT EXISTS work_entries (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
        hours DECIMAL(5,2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_clients_user_email ON clients(user_email)',
      'CREATE INDEX IF NOT EXISTS idx_work_entries_client_id ON work_entries(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_work_entries_user_email ON work_entries(user_email)',
      'CREATE INDEX IF NOT EXISTS idx_work_entries_date ON work_entries(date)'
    ];

    await db.query(createUsersTable);
    await db.query(createClientsTable);
    await db.query(createWorkEntriesTable);

    for (const indexQuery of createIndexes) {
      await db.query(indexQuery);
    }

    console.log('Database tables and indexes created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function closeDatabase() {
  if (pool) {
    try {
      await pool.end();
      console.log('PostgreSQL pool closed');
      pool = null;
    } catch (error) {
      console.error('Error closing database pool:', error);
      throw error;
    }
  }
}

async function checkDatabaseHealth() {
  const db = getDatabase();
  try {
    const result = await db.query('SELECT 1 as health_check');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase,
  checkDatabaseHealth
};
