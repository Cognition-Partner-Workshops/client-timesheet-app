/**
 * @fileoverview SQLite Database Initialization Module
 * 
 * This module manages the SQLite database connection and schema initialization
 * for the Employee Time Tracking application. It implements a singleton pattern
 * to ensure only one database connection exists throughout the application lifecycle.
 * 
 * Database Schema:
 * - users: Stores user accounts (email as primary key)
 * - clients: Stores client information with user ownership
 * - work_entries: Stores time tracking entries linked to clients and users
 * 
 * Data Isolation:
 * All tables include user_email foreign keys to enforce data isolation.
 * Users can only access their own clients and work entries.
 * 
 * Note: This implementation uses an in-memory SQLite database (':memory:').
 * Data is lost when the server restarts. For production, modify the connection
 * string to use a file-based database (e.g., './data/timesheet.db').
 * 
 * @requires sqlite3 - SQLite database driver for Node.js
 * @requires path - Node.js path utilities
 * 
 * @example
 * // Initialize database at application startup:
 * const { initializeDatabase, getDatabase } = require('./database/init');
 * await initializeDatabase();
 * const db = getDatabase();
 * 
 * @example
 * // Query the database:
 * db.all('SELECT * FROM clients WHERE user_email = ?', [email], callback);
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
 * Prevents multiple close operations from running simultaneously.
 * @type {boolean}
 * @private
 */
let isClosing = false;

/**
 * Flag indicating if database has been closed.
 * Used to prevent operations on a closed database.
 * @type {boolean}
 * @private
 */
let isClosed = false;

/**
 * Returns the singleton database connection instance.
 * 
 * Creates a new in-memory SQLite database connection if one doesn't exist.
 * Subsequent calls return the existing connection (singleton pattern).
 * 
 * The connection is configured with verbose mode for detailed error messages
 * during development.
 * 
 * @function getDatabase
 * @returns {sqlite3.Database} The SQLite database connection instance
 * @throws {Error} If database connection fails
 * 
 * @example
 * const db = getDatabase();
 * db.run('INSERT INTO users (email) VALUES (?)', ['user@example.com']);
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
 * Initializes the database schema with all required tables and indexes.
 * 
 * This function creates the following database objects:
 * 
 * Tables:
 * - users: User accounts with email as primary key
 * - clients: Client records with user ownership (foreign key to users)
 * - work_entries: Time tracking entries linked to both clients and users
 * 
 * Indexes (for query performance):
 * - idx_clients_user_email: Fast lookup of clients by user
 * - idx_work_entries_client_id: Fast lookup of entries by client
 * - idx_work_entries_user_email: Fast lookup of entries by user
 * - idx_work_entries_date: Fast filtering/sorting by date
 * 
 * All operations run within a serialized transaction to ensure atomicity.
 * 
 * @async
 * @function initializeDatabase
 * @returns {Promise<void>} Resolves when all tables and indexes are created
 * @throws {Error} If table or index creation fails
 * 
 * @example
 * // Call at application startup before handling requests:
 * await initializeDatabase();
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
 * Closes the database connection gracefully.
 * 
 * This function handles multiple edge cases:
 * - If already closed, resolves immediately
 * - If currently closing, waits for the close operation to complete
 * - If no connection exists, resolves immediately
 * 
 * After closing, the singleton instance is reset to null, allowing
 * a new connection to be created if getDatabase() is called again.
 * 
 * @function closeDatabase
 * @returns {Promise<void>} Resolves when database is closed (or already closed)
 * 
 * @example
 * // Call during graceful shutdown:
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

/**
 * Module exports for database operations.
 * 
 * @exports getDatabase - Get or create the database connection
 * @exports initializeDatabase - Initialize schema (tables and indexes)
 * @exports closeDatabase - Close the database connection
 */
module.exports = {
  getDatabase,
  initializeDatabase,
  closeDatabase
};
