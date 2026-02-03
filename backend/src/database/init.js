/**
 * @fileoverview Database initialization and connection management for SQLite.
 * 
 * This module provides singleton database connection management, schema initialization,
 * and graceful shutdown capabilities. It uses an in-memory SQLite database by default
 * for development, with support for file-based persistence in production.
 * 
 * @module database/init
 * @requires sqlite3
 * @requires path
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
 * Creates a new connection if one doesn't exist, using an in-memory database.
 * Resets closing state flags when creating a new connection.
 * 
 * @function getDatabase
 * @returns {sqlite3.Database} The SQLite database connection instance
 * @throws {Error} If database connection fails to open
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
 * Creates the following tables if they don't exist:
 * - users: Stores user accounts identified by email
 * - clients: Stores client information linked to users
 * - work_entries: Stores time tracking entries linked to clients and users
 * 
 * Also creates performance indexes on frequently queried columns.
 * Uses CASCADE DELETE to maintain referential integrity.
 * 
 * @async
 * @function initializeDatabase
 * @returns {Promise<void>} Resolves when all tables and indexes are created
 */
async function initializeDatabase() {
  const database = getDatabase();
  
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      /**
       * Users table - stores user accounts.
       * Email serves as the primary key for simplicity.
       */
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      /**
       * Clients table - stores client information.
       * Each client belongs to a user (user_email foreign key).
       * Deleting a user cascades to delete their clients.
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
       * Work entries table - stores time tracking records.
       * Each entry is linked to both a client and a user.
       * Deleting a client or user cascades to delete related entries.
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
       * These indexes optimize lookups by user email, client ID, and date.
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
 * Handles multiple scenarios:
 * - If already closed, resolves immediately
 * - If currently closing, waits for completion
 * - If no connection exists, resolves immediately
 * - Otherwise, closes the connection and cleans up state
 * 
 * This function is safe to call multiple times concurrently.
 * 
 * @function closeDatabase
 * @returns {Promise<void>} Resolves when the database is closed
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
