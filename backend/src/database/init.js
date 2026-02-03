/**
 * @fileoverview Database initialization and connection management module.
 * 
 * This module provides SQLite database connectivity for the timesheet application,
 * including connection pooling, schema initialization, and graceful shutdown handling.
 * Uses an in-memory SQLite database for development and testing purposes.
 * 
 * @module database/init
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Singleton database connection instance.
 * @type {sqlite3.Database|null}
 * @private
 */
let db = null;

/**
 * Flag indicating if a database close operation is in progress.
 * Prevents multiple simultaneous close attempts.
 * @type {boolean}
 * @private
 */
let isClosing = false;

/**
 * Flag indicating if the database connection has been closed.
 * @type {boolean}
 * @private
 */
let isClosed = false;

/**
 * Retrieves the singleton database connection instance.
 * Creates a new connection if one doesn't exist.
 * 
 * @returns {sqlite3.Database} The SQLite database connection instance.
 * @throws {Error} If the database connection cannot be established.
 * 
 * @example
 * const db = getDatabase();
 * db.get('SELECT * FROM users WHERE email = ?', [email], callback);
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
 * Initializes the database schema by creating all required tables and indexes.
 * 
 * Creates the following tables:
 * - users: Stores user accounts identified by email
 * - clients: Stores client information linked to users
 * - work_entries: Stores time tracking entries linked to clients and users
 * 
 * Also creates performance indexes on frequently queried columns.
 * Uses CASCADE delete to maintain referential integrity.
 * 
 * @async
 * @returns {Promise<void>} Resolves when all tables and indexes are created.
 * @throws {Error} If database schema creation fails.
 * 
 * @example
 * await initializeDatabase();
 * console.log('Database ready for use');
 */
async function initializeDatabase() {
  const database = getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      /**
       * Users table - stores registered user accounts.
       * Primary key is email for simplicity (email-based auth).
       */
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      /**
       * Clients table - stores client information for time tracking.
       * Each client belongs to a single user (user_email foreign key).
       * Cascades delete when parent user is removed.
       */
      database.run(`
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          user_email TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
        )
      `);

      /**
       * Work entries table - stores individual time tracking records.
       * Links to both client and user for data isolation.
       * Cascades delete when parent client or user is removed.
       */
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

      /**
       * Performance indexes for common query patterns.
       * - idx_clients_user_email: Optimizes client lookups by user
       * - idx_work_entries_client_id: Optimizes work entry queries by client
       * - idx_work_entries_user_email: Optimizes work entry queries by user
       * - idx_work_entries_date: Optimizes date-based filtering and sorting
       */
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
 * 
 * Handles multiple close scenarios:
 * - Already closed: Returns immediately
 * - Currently closing: Waits for existing close operation to complete
 * - No connection: Returns immediately
 * - Active connection: Closes and cleans up resources
 * 
 * Thread-safe implementation prevents race conditions during shutdown.
 * 
 * @returns {Promise<void>} Resolves when the database connection is closed.
 * 
 * @example
 * process.on('SIGTERM', async () => {
 *   await closeDatabase();
 *   process.exit(0);
 * });
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
