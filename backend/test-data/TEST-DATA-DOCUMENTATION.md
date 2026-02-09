# Test Data Documentation - Client Timesheet Application

> **WARNING**: All data in this directory is **SYNTHETIC TEST DATA** only. It must not be used in production environments.

## Overview

This directory contains 50 test data entries across 5 core application scenarios, provided in three formats:
- **SQL** (`test-data.sql`) - Direct INSERT statements for SQLite
- **JSON** (`test-data.json`) - Structured data with metadata and rationale
- **Script** (`seed-test-data.js`) - Node.js script to load data into the in-memory database

## Scenarios and Entry Breakdown

| # | Scenario | Table | Entries | Description |
|---|----------|-------|---------|-------------|
| 1 | User Authentication | `users` | 10 | Email-based login entries for diverse user roles |
| 2 | Client Management | `clients` | 10 | Fictional companies across 10 industries |
| 3 | Time Entry Tracking | `work_entries` | 10 | Work hours for clients 1-5 (test.user1) |
| 4 | Reporting | `work_entries` | 10 | Work hours for clients 6-10 (multi-user) |
| 5 | Data Export | `work_entries` | 10 | Dense entries for client 1 (export testing) |
| | **Total** | | **50** | |

## Data Construction Methodology

### Scenario 1: User Authentication (10 users)

**Method**: Synthetic email addresses using RFC 2606 reserved domains.

**Conventions**:
- `@example.com` - Reserved per RFC 2606, guaranteed not to conflict with real addresses
- `@testdomain.com` - Clearly identifiable as test data
- Prefix pattern: `{role}.{identifier}` (e.g., `qa.engineer`, `dev.lead`)

**Rationale**: Covers the full spectrum of user types that would interact with a timesheet system: QA engineers, developers, project managers, admins, contractors, and interns.

### Scenario 2: Client Management (10 clients)

**Method**: Fictional company names inspired by well-known fictional brands, paired with generic industry descriptions.

**Conventions**:
- Company names: Clearly fictional (Acme, Globex, Initech, Umbrella, Stark, Wayne, Oceanic, Wonka, Pied Piper, Hooli)
- Contact emails: `{role}@{company}-test.example.com`
- Descriptions prefixed with "Test client -"
- Clients distributed across 4 users to test data isolation

**Rationale**: Covers 10 distinct industries (tech, finance, healthcare, retail, manufacturing, logistics, airlines, education, data services, cloud) to ensure varied test scenarios.

### Scenario 3: Time Entry Tracking (10 work entries)

**Method**: Realistic consulting task descriptions with varied hours (0.5 - 8.0) across a two-week period.

**Conventions**:
- All descriptions prefixed with "TEST ENTRY -"
- Hours range covers edge cases: minimum (0.5), fractional (4.5, 6.5), and maximum full-day (8.0)
- Dates span Dec 1-12, 2025 (weekdays only)
- All entries belong to `test.user1@example.com` for clients 1-5

**Rationale**: Represents typical consulting activities: sprint planning, API development, wireframe reviews, compliance work, security audits, database migration, checkout implementation, integration testing, hotfixes, and dashboard setup.

### Scenario 4: Reporting (10 work entries)

**Method**: Multi-user work entries for clients 6-10 enabling per-client report generation.

**Conventions**:
- Entries distributed across 3 users (`qa.engineer`, `dev.lead`, `project.manager`)
- 2 entries per client to produce meaningful aggregated totals
- Hours and dates designed to create distinct report summaries per client

**Rationale**: Tests the reporting endpoints (`GET /api/reports/client/:clientId`) with data from multiple users and clients, ensuring correct aggregation of `totalHours` and `entryCount`.

### Scenario 5: Data Export (10 work entries)

**Method**: Dense entries for a single client (Acme Tech Solutions, ID 1) spanning a full month.

**Conventions**:
- All entries for client 1, owned by `test.user1@example.com`
- Hours include edge cases: 0.75, 1.0, 2.0, 2.25, 3.5, 4.25, 5.75, 6.0, 7.0, 8.0
- Dates span Nov 3-24, 2025 to test date range coverage
- Description lengths vary from short ("Quick bug triage session") to long

**Rationale**: Provides sufficient volume and variety for CSV/PDF export testing. The varied hours test decimal formatting, and the date range ensures proper chronological ordering in exports.

## PII Compliance

All test data follows these privacy principles:

1. **No real personal data**: All emails use reserved domains (`example.com` per RFC 2606) or clearly fake domains (`testdomain.com`)
2. **No real company names**: All client names are fictional (from movies, TV shows, or common test naming conventions)
3. **Clear labeling**: Every work entry description is prefixed with "TEST ENTRY -"
4. **No sensitive information**: No passwords, SSNs, phone numbers, or addresses are included
5. **Test-oriented naming**: Email prefixes use role-based patterns (`test.user1`, `qa.engineer`) rather than real names

## How to Load Test Data

### Option 1: Using the Seed Script (Recommended)

```bash
cd backend
node test-data/seed-test-data.js
```

This initializes the database schema and inserts all 50 entries. Output includes a summary of records created.

> **Note**: In development mode, the app uses an in-memory SQLite database. Data is lost on server restart. Run the seed script after starting the backend server, or integrate it into the startup flow.

### Option 2: Using SQL Directly

Load the SQL file into any SQLite database after the schema has been created:

```bash
sqlite3 /path/to/timesheet.db < backend/test-data/test-data.sql
```

### Option 3: Via the Application API

Use the JSON file as a reference to create entries through the REST API:

```bash
# 1. Login to get a session
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test.user1@example.com"}'

# 2. Create a client (use the token from login response)
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Acme Tech Solutions", "description": "Test client - Software development consulting"}'

# 3. Create a work entry
curl -X POST http://localhost:3001/api/work-entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"clientId": 1, "hours": 4.5, "description": "TEST ENTRY - Sprint planning", "date": "2025-12-01"}'
```

## File Inventory

| File | Format | Purpose |
|------|--------|---------|
| `test-data.sql` | SQL | INSERT statements for direct database loading |
| `test-data.json` | JSON | Structured data with metadata and per-scenario documentation |
| `seed-test-data.js` | JavaScript | Automated seeder script using the app's database module |
| `TEST-DATA-DOCUMENTATION.md` | Markdown | This documentation file |
