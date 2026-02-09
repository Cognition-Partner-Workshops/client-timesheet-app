const fs = require('fs');
const path = require('path');
const { getDatabase, initializeDatabase } = require('../src/database/init');

async function seedTestData() {
  console.log('=== Client Timesheet App - Test Data Seeder ===');
  console.log('WARNING: This script loads SYNTHETIC TEST DATA only.\n');

  await initializeDatabase();
  const db = getDatabase();

  const sqlFile = path.join(__dirname, 'test-data.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');

  const statements = sql
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const statement of statements) {
    await new Promise((resolve) => {
      db.run(statement, function (err) {
        if (err) {
          console.error(`ERROR: ${err.message}`);
          console.error(`  Statement: ${statement.substring(0, 80)}...`);
          errorCount++;
        } else {
          successCount++;
        }
        resolve();
      });
    });
  }

  console.log(`\nSeeding complete:`);
  console.log(`  Successful: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);

  const counts = await new Promise((resolve) => {
    db.get(
      `SELECT 
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM clients) as client_count,
        (SELECT COUNT(*) FROM work_entries) as work_entry_count`,
      (err, row) => {
        if (err) {
          console.error('Failed to verify counts:', err.message);
          resolve(null);
        } else {
          resolve(row);
        }
      }
    );
  });

  if (counts) {
    console.log(`\nDatabase summary:`);
    console.log(`  Users: ${counts.user_count}`);
    console.log(`  Clients: ${counts.client_count}`);
    console.log(`  Work Entries: ${counts.work_entry_count}`);
  }

  console.log('\nTest data loaded successfully.');
}

if (require.main === module) {
  seedTestData().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { seedTestData };
