/**
 * @fileoverview Database initialization and connection management module.
 * Provides singleton pattern database connection for SQLite in-memory database.
 * Handles table creation, indexing, and connection lifecycle management.
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
 * Flag indicating if database is currently in the process of closing.
 * @type {boolean}
 * @private
 */
let isClosing = false;

/**
 * Flag indicating if database connection has been closed.
 * @type {boolean}
 * @private
 */
let isClosed = false;

/**
 * Gets or creates the singleton SQLite database connection.
 * Uses in-memory database for development/testing purposes.
 * Resets connection state flags when creating a new connection.
 * 
 * @returns {sqlite3.Database} The SQLite database instance.
 * @throws {Error} If database connection fails to open.
 * @example
 * const db = getDatabase();
 * db.all('SELECT * FROM users', [], (err, rows) => {
 *   if (err) console.error(err);
 *   console.log(rows);
 * });
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
 * Initializes the database schema by creating required tables and indexes.
 * Creates users, clients, and work_entries tables with appropriate foreign key relationships.
 * Uses CREATE TABLE IF NOT EXISTS for idempotent execution.
 * 
 * Tables created:
 * - users: Stores user accounts with email as primary key
 * - clients: Stores client information linked to users
 * - work_entries: Stores time tracking entries linked to clients and users
 * 
 * Indexes created for performance optimization:
 * - idx_clients_user_email: Fast lookup of clients by user
 * - idx_work_entries_client_id: Fast lookup of entries by client
 * - idx_work_entries_user_email: Fast lookup of entries by user
 * - idx_work_entries_date: Fast date-range queries for reports
 * 
 * @async
 * @returns {Promise<void>} Resolves when all tables and indexes are created.
 * @throws {Error} If database operations fail.
 * @example
 * await initializeDatabase();
 * console.log('Database schema initialized');
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
 * Closes the database connection gracefully.
 * Handles multiple close scenarios: already closed, currently closing, or active connection.
 * Uses polling mechanism to wait for in-progress close operations.
 * Resets singleton state to allow new connections after close.
 * 
 * @returns {Promise<void>} Resolves when database connection is closed.
 * @example
 * await closeDatabase();
 * console.log('Database connection closed');
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
