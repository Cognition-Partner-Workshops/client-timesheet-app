/**
 * @fileoverview Database initialization and connection management for the Client Timesheet Application.
 * This module provides singleton database connection management, schema initialization,
 * and graceful shutdown capabilities for SQLite database operations.
 * 
 * @module database/init
 * @requires sqlite3
 * @requires path
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Singleton database connection instance
 * @type {sqlite3.Database|null}
 * @private
 */
let db = null;

/**
 * Flag indicating if database is currently being closed
 * @type {boolean}
 * @private
 */
let isClosing = false;

/**
 * Flag indicating if database has been closed
 * @type {boolean}
 * @private
 */
let isClosed = false;

/**
 * Returns the singleton SQLite database connection.
 * Creates a new in-memory database connection if one doesn't exist.
 * This function ensures only one database connection is active at any time.
 * 
 * @function getDatabase
 * @returns {sqlite3.Database} The SQLite database connection instance
 * @throws {Error} If database connection fails to open
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
 * This function should be called once during application startup.
 * 
 * Creates the following tables:
 * - users: Stores user information with email as primary key
 * - clients: Stores client information linked to users
 * - work_entries: Stores time tracking entries linked to clients and users
 * 
 * Also creates performance indexes on frequently queried columns.
 * 
 * @async
 * @function initializeDatabase
 * @returns {Promise<void>} Resolves when all tables and indexes are created
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
       * Users table - stores authenticated user accounts
       * Uses email as primary key for simple email-based authentication
       */
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      /**
       * Clients table - stores client/project information
       * Each client belongs to a specific user (user_email foreign key)
       * Cascades delete to remove associated work entries when client is deleted
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
       * Work entries table - stores time tracking records
       * Links to both clients and users with cascade delete behavior
       * Hours stored as decimal for precise time tracking
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
       * Performance indexes for optimizing common query patterns
       * These indexes improve lookup speed for user-specific and date-based queries
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
 * Handles concurrent close requests and ensures the connection is properly released.
 * This function is idempotent - calling it multiple times is safe.
 * 
 * @async
 * @function closeDatabase
 * @returns {Promise<void>} Resolves when the database connection is closed
 * 
 * @example
 * // During application shutdown
 * await closeDatabase();
 * console.log('Database connection released');
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
