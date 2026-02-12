/**
 * @fileoverview SQLite database initialisation and lifecycle management.
 *
 * Provides a singleton database connection, schema creation (users, clients,
 * work_entries tables plus performance indexes), and a graceful shutdown
 * helper.  In development the database runs in-memory; production overrides
 * swap this for a file-backed instance (see docker/overrides/database/init.js).
 *
 * @module database/init
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/** @type {?import('sqlite3').Database} Singleton database connection. */
let db = null;

/** @type {boolean} Whether a close operation is currently in progress. */
let isClosing = false;

/** @type {boolean} Whether the connection has been fully closed. */
let isClosed = false;

/**
 * Returns the singleton SQLite database connection, creating it on the first
 * call.  Subsequent calls return the same instance.
 *
 * In development mode the database is stored entirely in memory (`:memory:`),
 * which means all data is lost when the process exits.
 *
 * @returns {import('sqlite3').Database} The active database connection.
 * @throws {Error} If the underlying SQLite driver fails to open the database.
 */
function getDatabase() {
  if (!db) {
    // Reset state when creating a new database connection
    isClosing = false;
    isClosed = false;
    // Use in-memory database as specified in requirements
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
 * Creates the application schema if it does not already exist and adds
 * performance indexes on frequently-queried columns.
 *
 * Tables created:
 *  - **users** - keyed by email address.
 *  - **clients** - belongs to a user; CASCADE-deletes when the user is removed.
 *  - **work_entries** - belongs to both a client and a user; CASCADE-deletes
 *    when either parent is removed.
 *
 * Indexes:
 *  - `idx_clients_user_email` - speeds up per-user client lookups.
 *  - `idx_work_entries_client_id` - speeds up per-client entry lookups.
 *  - `idx_work_entries_user_email` - speeds up per-user entry lookups.
 *  - `idx_work_entries_date` - speeds up date-range report queries.
 *
 * @async
 * @returns {Promise<void>} Resolves once all DDL statements have executed.
 */
async function initializeDatabase() {
  const database = getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Create users table
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create clients table
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

      // Create work_entries table
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

      // Create indexes for better performance
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
 * Safe to call multiple times - concurrent or repeated calls are coalesced so
 * the underlying `db.close()` only executes once.  After closing, the next
 * call to {@link getDatabase} will open a fresh connection.
 *
 * @returns {Promise<void>} Resolves once the connection has been closed (or
 *          was already closed).
 */
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
