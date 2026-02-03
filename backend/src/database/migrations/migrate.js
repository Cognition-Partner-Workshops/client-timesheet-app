/**
 * Database Migration Runner
 * 
 * This script executes SQL migration files in order to set up or update
 * the database schema and seed data.
 * 
 * Usage:
 *   node migrate.js [options]
 * 
 * Options:
 *   --seed    Run seed data migration (002_seed_data.sql)
 *   --reset   Drop all tables and re-run all migrations
 *   --status  Show migration status
 * 
 * Examples:
 *   node migrate.js              # Run pending migrations
 *   node migrate.js --seed       # Run migrations including seed data
 *   node migrate.js --reset      # Reset database and run all migrations
 *   node migrate.js --status     # Show which migrations have been applied
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DATABASE_PATH = process.env.DATABASE_PATH || ':memory:';
const MIGRATIONS_DIR = __dirname;

function getDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DATABASE_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`Connected to database: ${DATABASE_PATH}`);
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(db);
          }
        });
      }
    });
  });
}

function runQuery(db, sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

function allQuery(db, sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function ensureMigrationsTable(db) {
  await runQuery(db, `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(db) {
  try {
    const rows = await allQuery(db, 'SELECT migration_name FROM schema_migrations ORDER BY id');
    return rows.map(row => row.migration_name);
  } catch (err) {
    return [];
  }
}

function getMigrationFiles(includeSeed = false) {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (!includeSeed) {
    return files.filter(file => !file.includes('seed'));
  }
  
  return files;
}

async function runMigration(db, filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf8');
  
  console.log(`\nRunning migration: ${filename}`);
  console.log('-'.repeat(50));
  
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  for (const statement of statements) {
    try {
      await runQuery(db, statement);
    } catch (err) {
      if (!err.message.includes('UNIQUE constraint failed') && 
          !err.message.includes('already exists')) {
        throw err;
      }
    }
  }
  
  console.log(`Migration ${filename} completed successfully`);
}

async function resetDatabase(db) {
  console.log('\nResetting database...');
  console.log('-'.repeat(50));
  
  const tables = ['work_entries', 'clients', 'users', 'schema_migrations'];
  
  for (const table of tables) {
    try {
      await runQuery(db, `DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped table: ${table}`);
    } catch (err) {
      console.log(`Could not drop table ${table}: ${err.message}`);
    }
  }
  
  console.log('Database reset complete');
}

async function showStatus(db) {
  console.log('\nMigration Status');
  console.log('='.repeat(50));
  
  const applied = await getAppliedMigrations(db);
  const allFiles = getMigrationFiles(true);
  
  for (const file of allFiles) {
    const migrationName = file.replace('.sql', '');
    const status = applied.includes(migrationName) ? '[APPLIED]' : '[PENDING]';
    console.log(`${status} ${file}`);
  }
  
  console.log('='.repeat(50));
  console.log(`Total: ${allFiles.length} migrations, ${applied.length} applied, ${allFiles.length - applied.length} pending`);
}

async function migrate(options = {}) {
  const { seed = false, reset = false, status = false } = options;
  
  let db;
  try {
    db = await getDatabase();
    
    if (status) {
      await ensureMigrationsTable(db);
      await showStatus(db);
      return;
    }
    
    if (reset) {
      await resetDatabase(db);
    }
    
    await ensureMigrationsTable(db);
    
    const applied = await getAppliedMigrations(db);
    const migrationFiles = getMigrationFiles(seed);
    
    console.log('\nStarting migrations...');
    console.log('='.repeat(50));
    
    let migrationsRun = 0;
    
    for (const file of migrationFiles) {
      const migrationName = file.replace('.sql', '');
      
      if (!applied.includes(migrationName)) {
        await runMigration(db, file);
        migrationsRun++;
      } else {
        console.log(`Skipping ${file} (already applied)`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    if (migrationsRun > 0) {
      console.log(`Successfully ran ${migrationsRun} migration(s)`);
    } else {
      console.log('No pending migrations to run');
    }
    
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('\nDatabase connection closed');
        }
      });
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    seed: args.includes('--seed'),
    reset: args.includes('--reset'),
    status: args.includes('--status')
  };
}

if (require.main === module) {
  const options = parseArgs();
  migrate(options);
}

module.exports = { migrate, getDatabase, runMigration };
