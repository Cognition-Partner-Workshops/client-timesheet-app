/**
 * @fileoverview Database initialization and connection management for SQLite.
 * Provides singleton database connection, schema initialization, and graceful shutdown.
 * Uses in-memory SQLite database by default for development.
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
 * Flag indicating if database is currently being closed.
 * @type {boolean}
 * @private
 */
let isClosing = false;

/**
 * Flag indicating if database has been closed.
 * @type {boolean}
 * @private
 */
let isClosed = false;

/**
 * Returns the singleton SQLite database connection.
 * Creates a new in-memory database connection if one doesn't exist.
 * Resets closing state flags when creating a new connection.
 * @function getDatabase
 * @returns {sqlite3.Database} The SQLite database connection instance
 * @throws {Error} If database connection cannot be established
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
 * Creates the following tables:
 * - users: Stores user information with email as primary key
 * - clients: Stores client information linked to users
 * - work_entries: Stores time tracking entries linked to clients and users
 * 
 * Also creates performance indexes on frequently queried columns.
 * Uses CASCADE DELETE for referential integrity.
 * @async
 * @function initializeDatabase
 * @returns {Promise<void>} Resolves when all tables and indexes are created
 */
async function initializeDatabase() {
  const database = getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      /**
       * Users table: Stores registered user accounts.
       * Uses email as the primary key for simplicity.
       */
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      /**
       * Clients table: Stores client information for time tracking.
       * Each client belongs to a user (user_email foreign key).
       * Cascades delete when parent user is removed.
       */
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

      /**
       * Work entries table: Stores individual time tracking records.
       * Links to both clients and users with cascade delete.
       * Hours stored as decimal for precision (e.g., 1.5 hours).
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
       * Performance indexes for optimizing common query patterns:
       * - idx_clients_user_email: Fast lookup of clients by user
       * - idx_work_entries_client_id: Fast lookup of entries by client
       * - idx_work_entries_user_email: Fast lookup of entries by user
       * - idx_work_entries_date: Fast date-based filtering and sorting
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
 * Handles multiple close calls safely by tracking closing state.
 * If already closed or closing, waits for completion without error.
 * @function closeDatabase
 * @returns {Promise<void>} Resolves when database is closed
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
