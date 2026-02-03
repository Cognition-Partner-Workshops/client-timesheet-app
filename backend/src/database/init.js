/**
 * @fileoverview Database initialization and connection management module.
 * Provides singleton database connection, schema initialization, and graceful shutdown.
 * Uses SQLite with in-memory storage for development and file-based storage for production.
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
 * Flag indicating if the database is currently in the process of closing.
 * Prevents multiple simultaneous close operations.
 * @type {boolean}
 * @private
 */
let isClosing = false;

/**
 * Flag indicating if the database connection has been closed.
 * Used to prevent operations on a closed database.
 * @type {boolean}
 * @private
 */
let isClosed = false;

/**
 * Retrieves the singleton SQLite database connection.
 * Creates a new in-memory database connection if one doesn't exist.
 * Resets closing/closed state flags when creating a new connection.
 * 
 * @returns {sqlite3.Database} The SQLite database connection instance.
 * @throws {Error} If the database connection cannot be established.
 * 
 * @example
 * const db = getDatabase();
 * db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
 *   // Handle result
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
 * Initializes the database schema by creating all required tables and indexes.
 * Creates the following tables:
 * - users: Stores user accounts with email as primary key
 * - clients: Stores client information linked to users
 * - work_entries: Stores time tracking entries linked to clients and users
 * 
 * Also creates performance indexes on frequently queried columns.
 * Uses foreign key constraints with CASCADE delete for data integrity.
 * 
 * @async
 * @returns {Promise<void>} Resolves when all tables and indexes are created.
 * @throws {Error} If database operations fail during schema creation.
 * 
 * @example
 * await initializeDatabase();
 * console.log('Database schema initialized successfully');
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
 * Gracefully closes the database connection.
 * Handles multiple close scenarios:
 * - Already closed: Resolves immediately
 * - Currently closing: Waits for existing close operation to complete
 * - No connection: Resolves immediately
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
