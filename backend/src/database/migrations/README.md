# Database Migrations

This directory contains SQL migration scripts for the Client Timesheet Application database.

## Migration Files

| File | Description |
|------|-------------|
| 001_initial_schema.sql | Creates the initial database schema (users, clients, work_entries tables and indexes) |
| 002_seed_data.sql | Seeds the database with sample data for development and testing |
| migrate.js | Node.js migration runner script |

## Usage

### Running Migrations

From the backend directory, run:

```bash
# Run schema migrations only
node src/database/migrations/migrate.js

# Run migrations including seed data
node src/database/migrations/migrate.js --seed

# Reset database and run all migrations
node src/database/migrations/migrate.js --reset --seed

# Check migration status
node src/database/migrations/migrate.js --status
```

### Using with File-Based SQLite

Set the DATABASE_PATH environment variable to use a file-based database:

```bash
DATABASE_PATH=./data/timesheet.db node src/database/migrations/migrate.js --seed
```

### NPM Scripts

You can also add these scripts to your package.json:

```json
{
  "scripts": {
    "migrate": "node src/database/migrations/migrate.js",
    "migrate:seed": "node src/database/migrations/migrate.js --seed",
    "migrate:reset": "node src/database/migrations/migrate.js --reset --seed",
    "migrate:status": "node src/database/migrations/migrate.js --status"
  }
}
```

## Sample Data Overview

The seed data includes:

### Users (5 total)
- john.doe@example.com
- jane.smith@example.com
- mike.johnson@example.com
- sarah.williams@example.com
- david.brown@example.com

### Clients (10 total)
| Client | User | Department |
|--------|------|------------|
| Acme Corporation | john.doe@example.com | Engineering |
| TechStart Inc | john.doe@example.com | Product |
| Global Finance Ltd | john.doe@example.com | Finance |
| Healthcare Plus | jane.smith@example.com | Healthcare |
| EduTech Solutions | jane.smith@example.com | Education |
| RetailMax | mike.johnson@example.com | Sales |
| LogiTrans Corp | mike.johnson@example.com | Operations |
| MediaStream | sarah.williams@example.com | Media |
| GreenEnergy Co | sarah.williams@example.com | Energy |
| SecureBank | david.brown@example.com | Security |

### Work Entries (35 total)
Sample work entries are distributed across all users and clients with realistic descriptions including:
- Project setup and requirements gathering
- Database design and documentation
- API development and integration
- Testing and security audits
- Feature implementation

## Creating New Migrations

To create a new migration:

1. Create a new SQL file with the naming convention: `NNN_description.sql` (e.g., `003_add_projects_table.sql`)
2. Include the migration tracking insert at the end of your file:
   ```sql
   INSERT INTO schema_migrations (migration_name) VALUES ('003_add_projects_table');
   ```
3. Run the migration: `node src/database/migrations/migrate.js`

## Schema Migrations Table

The `schema_migrations` table tracks which migrations have been applied:

```sql
CREATE TABLE schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_name TEXT NOT NULL UNIQUE,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
