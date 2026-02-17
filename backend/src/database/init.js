/**
 * @file SQLite database lifecycle management.
 *
 * Provides a lazily-initialised, singleton in-memory SQLite connection along
 * with helpers to create the schema (users, clients, work_entries) and
 * gracefully close the connection.
 *
 * @module database/init
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/** @type {import('sqlite3').Database | null} Singleton database handle. */
let db = null;

/** @type {boolean} Guards against concurrent close calls. */
let isClosing = false;

/** @type {boolean} Indicates the connection has been fully closed. */
let isClosed = false;

/**
 * Returns the singleton SQLite database handle, creating a new in-memory
 * connection on the first call (or after the previous connection was closed).
 *
 * @returns {import('sqlite3').Database} The active database handle.
 * @throws {Error} If the SQLite driver fails to open the connection.
 */
function getDatabase() {
  if (!db) {
    isClosing = false;
    isClosed = false;
    db = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        console.error('Error opening database:', err);
        throw err;
      }
      console.log('Connected to SQLite in-memory database');
    });
  }
  return db;
}

/**
 * Creates the application schema inside the current database connection.
 *
 * Tables created (all with `IF NOT EXISTS`):
 * - **users** – keyed by email.
 * - **clients** – belongs to a user; cascading delete on user removal.
 * - **work_entries** – belongs to a client and a user; cascading deletes.
 *
 * Performance indexes are added on the foreign-key and date columns.
 *
 * @async
 * @returns {Promise<void>} Resolves once all DDL statements have executed.
 */
async function initializeDatabase() {
  const database = getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

      console.log('Database tables created successfully');
      resolve();
    });
  });
}

/**
 * Gracefully closes the current database connection.
 *
 * Safe to call multiple times – subsequent calls resolve immediately if the
 * connection is already closed, and concurrent calls are serialised via the
 * {@link isClosing} flag.
 *
 * @returns {Promise<void>} Resolves once the connection is fully closed.
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (isClosed) {
      resolve();
      return;
    }
    
    if (isClosing) {
      const checkClosed = setInterval(() => {
        if (isClosed) {
          clearInterval(checkClosed);
          resolve();
        }
      }, 10);
      return;
    }
    
    if (!db) {
      resolve();
      return;
    }
    
    isClosing = true;
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
  });
}

module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase
};
