const fs = require('fs');
const path = require('path');
const { getDatabase, initializeDatabase } = require('../src/database/init');

async function seedSyntheticQAData() {
  console.log('=== Client Timesheet App - Synthetic QA Data Seeder ===');
  console.log('Generated from 2-day log analysis (2026-02-07 to 2026-02-09)');
  console.log('WARNING: All data is SYNTHETIC - No real PII included.\n');

  await initializeDatabase();
  const db = getDatabase();

  const sqlFile = path.join(__dirname, 'synthetic-qa-data.sql');
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
    console.log(`  Total rows: ${counts.user_count + counts.client_count + counts.work_entry_count}`);
  }

  const hourStats = await new Promise((resolve) => {
    db.get(
      `SELECT 
        MIN(hours) as min_hours,
        MAX(hours) as max_hours,
        AVG(hours) as avg_hours,
        COUNT(*) as total_entries
      FROM work_entries`,
      (err, row) => {
        if (err) {
          resolve(null);
        } else {
          resolve(row);
        }
      }
    );
  });

  if (hourStats) {
    console.log(`\nWork entry hours statistics:`);
    console.log(`  Min: ${hourStats.min_hours}`);
    console.log(`  Max: ${hourStats.max_hours}`);
    console.log(`  Avg: ${parseFloat(hourStats.avg_hours).toFixed(2)}`);
    console.log(`  Count: ${hourStats.total_entries}`);
  }

  console.log('\nSynthetic QA data loaded successfully.');
}

if (require.main === module) {
  seedSyntheticQAData().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { seedSyntheticQAData };
