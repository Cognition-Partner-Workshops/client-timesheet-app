const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;
let isClosing = false;
let isClosed = false;

function createSqliteDatabase() {
  return new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error('Error opening database:', err);
      throw err;
    }
    console.log('Connected to SQLite in-memory database');
  });
}

function createPostgresDatabase() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  console.log('Connected to PostgreSQL database');
  return pool;
}

function createMysqlDatabase() {
  const mysql = require('mysql2');
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
  });
  console.log('Connected to MySQL database');
  return pool.promise();
}

function getDatabase() {
  if (!db) {
    isClosing = false;
    isClosed = false;

    const dbType = (process.env.DATABASE_TYPE || 'sqlite').toLowerCase();

    if (dbType === 'postgres') {
      db = createPostgresDatabase();
    } else if (dbType === 'mysql') {
      db = createMysqlDatabase();
    } else {
      db = createSqliteDatabase();
    }
  }
  return db;
}

async function initializeDatabase() {
  const database = getDatabase();
  const dbType = (process.env.DATABASE_TYPE || 'sqlite').toLowerCase();

  if (dbType === 'postgres' || dbType === 'mysql') {
    console.log(`Using ${dbType} database. Ensure schema migrations have been applied.`);
    return;
  }

  return new Promise((resolve, reject) => {
    database.serialize(() => {
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY,
          password_hash TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_email TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          department TEXT,
          email TEXT,
          user_email TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS work_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER NOT NULL,
          user_email TEXT NOT NULL,
          hours DECIMAL(5,2) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
          FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
        )
      `);

      database.run(`CREATE INDEX IF NOT EXISTS idx_clients_user_email ON clients (user_email)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_work_entries_client_id ON work_entries (client_id)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_work_entries_user_email ON work_entries (user_email)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_work_entries_date ON work_entries (date)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_email ON refresh_tokens (user_email)`);
      database.run(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens (token)`);

      console.log('Database tables created successfully');
      resolve();
    });
  });
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (isClosed) {
      // Already closed, resolve immediately
      resolve();
      return;
    }
    
    if (isClosing) {
      // Currently closing, wait for it to complete
      const checkClosed = setInterval(() => {
        if (isClosed) {
          clearInterval(checkClosed);
          resolve();
        }
      }, 10);
      return;
    }
    
    if (!db) {
      // No database connection, resolve immediately
      resolve();
      return;
    }
    
    isClosing = true;

    const dbType = (process.env.DATABASE_TYPE || 'sqlite').toLowerCase();

    if (dbType === 'postgres') {
      db.end().then(() => {
        isClosed = true;
        isClosing = false;
        db = null;
        console.log('PostgreSQL connection pool closed');
        resolve();
      }).catch((err) => {
        isClosed = true;
        isClosing = false;
        db = null;
        console.error('Error closing PostgreSQL pool:', err);
        resolve();
      });
    } else if (dbType === 'mysql') {
      db.end().then(() => {
        isClosed = true;
        isClosing = false;
        db = null;
        console.log('MySQL connection pool closed');
        resolve();
      }).catch((err) => {
        isClosed = true;
        isClosing = false;
        db = null;
        console.error('Error closing MySQL pool:', err);
        resolve();
      });
    } else {
      db.close((err) => {
        isClosed = true;
        isClosing = false;
        db = null;
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        resolve();
      });
    }
  });
}

module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase
};
