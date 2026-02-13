/**
 * Database Initialization & Connection Management
 *
 * Provides the singleton SQLite connection used by the entire backend.
 * In development the database lives in memory (`:memory:`), so all data is
 * lost on restart. The production Docker build replaces this file with
 * `docker/overrides/database/init.js`, which points to a persistent file at
 * `/app/data/timesheet.db`.
 *
 * Exports:
 *  - getDatabase()        — Returns (or lazily creates) the singleton connection.
 *  - initializeDatabase() — Creates tables and indexes inside a serialized
 *                           transaction. Called once during server startup
 *                           (see server.js → startServer).
 *  - closeDatabase()      — Gracefully closes the connection. Used by the
 *                           test harness to tear down between suites.
 *
 * Schema overview (three tables, CASCADE deletes):
 *  users        — PK: email
 *  clients      — PK: id, FK: user_email → users(email)
 *  work_entries — PK: id, FK: client_id → clients(id),
 *                              user_email → users(email)
 *
 * Indexes are created on all foreign-key columns and on work_entries.date
 * to speed up the most common query patterns (list-by-user, filter-by-date).
 *
 * Related files:
 *  - server.js                       — calls initializeDatabase() at startup
 *  - middleware/auth.js              — queries users table for authentication
 *  - routes/clients.js               — CRUD on clients table
 *  - routes/workEntries.js           — CRUD on work_entries table
 *  - routes/reports.js               — read-only aggregation queries
 *  - docker/overrides/database/init.js — production file-based override
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;
let isClosing = false;
let isClosed = false;

/**
 * Returns the singleton database connection, creating it on first call.
 * Subsequent calls return the same instance. The connection flags are
 * reset when a new connection is created (relevant after closeDatabase()).
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
 * Creates all application tables and performance indexes.
 * Uses `db.serialize()` to guarantee sequential DDL execution, which is
 * important because later tables reference earlier ones via foreign keys.
 * Safe to call multiple times thanks to IF NOT EXISTS guards.
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

      // clients — each client belongs to exactly one user (multi-tenant isolation)
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

      // work_entries — time records linking a user to a client
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

      // Indexes on foreign-key and frequently-filtered columns.
      // These cover the WHERE user_email = ? and ORDER BY date patterns
      // used throughout routes/clients.js, routes/workEntries.js, and
      // routes/reports.js.
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
 * Gracefully closes the database connection.
 * Handles concurrent calls and already-closed states so callers don't
 * need to coordinate. Primarily used by the Jest test teardown
 * (see __tests__/) to release the in-memory database between test runs.
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
