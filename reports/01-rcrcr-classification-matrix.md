# RCRCR Classification Matrix

> **Repository**: Cognition-Partner-Workshops/client-timesheet-app
> **Analysis Date**: 2026-02-11
> **Release**: v3.1.0
> **Total TCs Analyzed**: 161
> **Overall Coverage**: 87.17% (Target: 80%+)

## Scoring Configuration

| Parameter | Value |
|-----------|-------|
| CHRONIC_FAILURE_WEIGHT | 0.35 |
| CHRONIC_DEFECT_WEIGHT | 0.65 |
| CHRONIC_THRESHOLD | 0.50 |
| Risk Weight | 1.00 |
| Core Weight | 0.90 |
| Chronic Weight | 0.80 |
| Recent Weight | 0.70 |
| Repair Weight | 0.60 |
| Config Weight | 0.50 |
| Unclassified Weight | 0.10 |

**Priority Score Formula**: `priority_score = max(classification_weights) + 0.1 * count(classifications)`

## Classification Matrix

### Authentication (auth.test.js) - 11 TCs

| TC ID | TC Name | Line | Classifications | Priority Score | Chronic Score | Execution Priority |
|-------|---------|------|----------------|---------------|--------------|-------------------|
| TC001 | should login existing user | 35 | Core, Recent-Direct, Repair-Direct | 1.2 | - | 1 |
| TC002 | should create new user on first login | 54 | Core, Recent-Direct, Repair-Direct | 1.2 | - | 2 |
| TC003 | should return 400 for invalid email | 77 | Core, Config | 1.1 | - | 6 |
| TC004 | should return 400 for missing email | 86 | Core | 1.0 | - | 10 |
| TC005 | should handle database error when checking user | 95 | Core, Config | 1.1 | - | 7 |
| TC006 | should handle database error when creating user | 108 | Core | 1.0 | - | 11 |
| TC007 | should handle unexpected errors in try-catch block | 125 | Core | 1.0 | - | 12 |
| TC008 | should return current user info | 140 | Core | 1.0 | - | 13 |
| TC009 | should return 401 if no email header provided | 159 | Core | 1.0 | - | 14 |
| TC010 | should return 404 if user not found (auth/me) | 166 | Core | 1.0 | - | 15 |
| TC011 | should handle database error (auth/me) | 185 | Core, Config | 1.1 | - | 8 |

### Authentication Middleware (middleware/auth.test.js) - 11 TCs

| TC ID | TC Name | Line | Classifications | Priority Score | Chronic Score | Execution Priority |
|-------|---------|------|----------------|---------------|--------------|-------------------|
| TC012 | should return 401 if x-user-email header is missing | 32 | Core | 1.0 | - | 16 |
| TC013 | should return 400 if email format is invalid | 42 | Core | 1.0 | - | 17 |
| TC014 | should accept valid email format | 54 | Core | 1.0 | - | 18 |
| TC015 | should authenticate existing user and call next() | 68 | Core | 1.0 | - | 19 |
| TC016 | should handle database error when checking user (middleware) | 85 | Core, Config | 1.1 | - | 9 |
| TC017 | should create new user if not exists and call next() | 106 | Core | 1.0 | - | 20 |
| TC018 | should handle error when creating new user (middleware) | 131 | Core | 1.0 | - | 21 |
| TC019 | should reject email without @ | 156 | Core | 1.0 | - | 22 |
| TC020 | should reject email without domain | 162 | Core | 1.0 | - | 23 |
| TC021 | should reject email without TLD | 168 | Core | 1.0 | - | 24 |
| TC022 | should accept email with subdomain | 174 | Core | 1.0 | - | 25 |

### Client CRUD (routes/clients.test.js) - 28 TCs

| TC ID | TC Name | Line | Classifications | Priority Score | Chronic Score | Execution Priority |
|-------|---------|------|----------------|---------------|--------------|-------------------|
| TC023 | should return all clients for authenticated user | 42 | Core, Recent-Indirect, Repair-Indirect | 1.2 | - | 3 |
| TC024 | should return empty array when no clients exist | 63 | Core | 1.0 | - | 26 |
| TC025 | should handle database error (clients list) | 74 | Core, Config | 1.1 | - | 27 |
| TC026 | should return specific client | 87 | Core | 1.0 | - | 28 |
| TC027 | should return 404 if client not found | 100 | Core | 1.0 | - | 29 |
| TC028 | should return 400 for invalid client ID | 111 | Core | 1.0 | - | 30 |
| TC029 | should handle database error (client get) | 118 | Core, Config | 1.1 | - | 31 |
| TC030 | should create new client with valid data | 131 | Core, Repair-Indirect | 1.1 | - | 32 |
| TC031 | should create client without description | 153 | Core | 1.0 | - | 33 |
| TC032 | should return 400 for missing name (client create) | 173 | Core | 1.0 | - | 34 |
| TC033 | should return 400 for empty name (client create) | 181 | Core | 1.0 | - | 35 |
| TC034 | should handle database insert error (client create) | 189 | Core, Config | 1.1 | - | 36 |
| TC035 | should update client name | 204 | Core | 1.0 | - | 37 |
| TC036 | should update client description | 228 | Core | 1.0 | - | 38 |
| TC037 | should return 404 if client not found (update) | 248 | Core | 1.0 | - | 39 |
| TC038 | should return 400 for invalid client ID (update) | 261 | Core | 1.0 | - | 40 |
| TC039 | should return 400 for empty update (client) | 270 | Core | 1.0 | - | 41 |
| TC040 | should delete existing client | 280 | Core, Recent-Direct, Repair-Direct | 1.2 | - | 4 |
| TC041 | should return 404 if client not found (delete) | 295 | Core | 1.0 | - | 42 |
| TC042 | should return 400 for invalid client ID (delete) | 306 | Core | 1.0 | - | 43 |
| TC043 | should handle database delete error (client) | 313 | Core, Config | 1.1 | - | 44 |
| TC044 | should handle database error when checking client existence (delete) | 328 | Core, Config | 1.1 | - | 45 |
| TC045 | should handle error retrieving client after creation | 341 | Core | 1.0 | - | 46 |
| TC046 | should handle database error when checking client existence (update) | 361 | Core, Config | 1.1 | - | 47 |
| TC047 | should handle database error during update (client) | 374 | Core | 1.0 | - | 48 |
| TC048 | should handle error retrieving client after update | 391 | Core | 1.0 | - | 49 |
| TC049 | should update both name and description (client) | 412 | Core | 1.0 | - | 50 |
| TC050 | should update description to null when empty string provided | 435 | Core | 1.0 | - | 51 |

### Work Entry CRUD (routes/workEntries.test.js) - 35 TCs

| TC ID | TC Name | Line | Classifications | Priority Score | Chronic Score | Execution Priority |
|-------|---------|------|----------------|---------------|--------------|-------------------|
| TC051 | should return all work entries for user | 42 | Core, Recent-Direct, Repair-Direct | 1.2 | - | 5 |
| TC052 | should filter by client ID when provided | 58 | Core | 1.0 | - | 52 |
| TC053 | should return 400 for invalid client ID filter | 73 | Core | 1.0 | - | 53 |
| TC054 | should handle database error (work entries list) | 80 | Core, Config | 1.1 | - | 54 |
| TC055 | should return specific work entry | 93 | Core | 1.0 | - | 55 |
| TC056 | should return 404 if work entry not found | 106 | Core | 1.0 | - | 56 |
| TC057 | should return 400 for invalid work entry ID | 117 | Core | 1.0 | - | 57 |
| TC058 | should create work entry with valid data | 126 | Core, Recent-Direct, Repair-Direct | 1.2 | - | 58 |
| TC059 | should return 400 if client not found (work entry create) | 155 | Core | 1.0 | - | 59 |
| TC060 | should return 400 for missing required fields (work entry) | 172 | Core | 1.0 | - | 60 |
| TC061 | should return 400 for invalid hours | 180 | Core, Repair-Direct | 1.1 | - | 61 |
| TC062 | should return 400 for hours exceeding 24 | 192 | Core | 1.0 | - | 62 |
| TC063 | should handle database error on insert (work entry) | 204 | Core, Config | 1.1 | - | 63 |
| TC064 | should update work entry hours | 227 | Core | 1.0 | - | 64 |
| TC065 | should update work entry client | 248 | Core | 1.0 | - | 65 |
| TC066 | should return 404 if work entry not found (update) | 264 | Core | 1.0 | - | 66 |
| TC067 | should return 400 for invalid work entry ID (update) | 277 | Core | 1.0 | - | 67 |
| TC068 | should return 400 for empty update (work entry) | 286 | Core | 1.0 | - | 68 |
| TC069 | should return 400 if new client not found (work entry update) | 294 | Core | 1.0 | - | 69 |
| TC070 | should delete existing work entry | 313 | Core, Repair-Indirect | 1.1 | - | 70 |
| TC071 | should return 404 if work entry not found (delete) | 328 | Core | 1.0 | - | 71 |
| TC072 | should return 400 for invalid work entry ID (delete) | 339 | Core | 1.0 | - | 72 |
| TC073 | should handle database delete error (work entry) | 346 | Core, Config | 1.1 | - | 73 |
| TC074 | should handle database error when checking work entry existence (delete) | 361 | Core, Config | 1.1 | - | 74 |
| TC075 | should handle database error when fetching single work entry | 374 | Core, Config | 1.1 | - | 75 |
| TC076 | should handle database error when verifying client (work entry create) | 387 | Core, Config | 1.1 | - | 76 |
| TC077 | should handle error retrieving work entry after creation | 404 | Core | 1.0 | - | 77 |
| TC078 | should handle database error when checking work entry existence (update) | 434 | Core, Config | 1.1 | - | 78 |
| TC079 | should handle database error when verifying new client in update | 447 | Core, Config | 1.1 | - | 79 |
| TC080 | should handle database error during update (work entry) | 466 | Core | 1.0 | - | 80 |
| TC081 | should handle error retrieving work entry after update | 483 | Core | 1.0 | - | 81 |
| TC082 | should update work entry date | 506 | Core | 1.0 | - | 82 |
| TC083 | should update work entry description | 527 | Core | 1.0 | - | 83 |
| TC084 | should update description to null when empty string (work entry) | 547 | Core | 1.0 | - | 84 |
| TC085 | should update multiple fields at once (work entry) | 567 | Core | 1.0 | - | 85 |

### Report Generation & Export (routes/reports.test.js) - 23 TCs

| TC ID | TC Name | Line | Classifications | Priority Score | Chronic Score | Execution Priority |
|-------|---------|------|----------------|---------------|--------------|-------------------|
| TC086 | should return client report with work entries | 62 | Core, Recent-Direct, Repair-Direct, Chronic | 1.3 | 0.52 | 86 |
| TC087 | should return report with zero hours for client with no entries | 86 | Core, Recent-Direct, Chronic | 1.2 | 0.52 | 87 |
| TC088 | should return 404 if client not found (report) | 104 | Core, Recent-Direct | 1.1 | - | 88 |
| TC089 | should return 400 for invalid client ID (report) | 115 | Core | 1.0 | - | 89 |
| TC090 | should handle database error when fetching client (report) | 122 | Core, Config | 1.1 | - | 90 |
| TC091 | should handle database error when fetching work entries (report) | 133 | Core, Config | 1.1 | - | 91 |
| TC092 | should filter work entries by user email (report) | 148 | Core | 1.0 | - | 92 |
| TC093 | should return 400 for invalid client ID (CSV export) | 169 | Core, Recent-Direct, Repair-Direct, Chronic, Config | 1.4 | 0.58 | 93 |
| TC094 | should return 404 if client not found (CSV export) | 176 | Core, Recent-Direct, Repair-Direct, Chronic, Config | 1.4 | 0.58 | 94 |
| TC095 | should handle database error when fetching client (CSV) | 187 | Core, Recent-Direct, Chronic, Config | 1.3 | 0.58 | 95 |
| TC096 | should handle database error when fetching work entries (CSV) | 198 | Core, Recent-Direct, Chronic, Config | 1.3 | 0.58 | 96 |
| TC097 | should return 400 for invalid client ID (PDF export) | 215 | Core, Recent-Direct, Repair-Direct, Chronic, Config | 1.4 | 0.58 | 97 |
| TC098 | should return 404 if client not found (PDF export) | 222 | Core, Recent-Direct, Repair-Direct, Chronic, Config | 1.4 | 0.58 | 98 |
| TC099 | should handle database error (PDF export) | 233 | Core, Recent-Direct, Chronic, Config | 1.3 | 0.58 | 99 |
| TC100 | should only return data for authenticated user (report data isolation) | 246 | Core | 1.0 | - | 100 |
| TC101 | should correctly sum decimal hours | 268 | Core | 1.0 | - | 101 |
| TC102 | should handle integer hours | 286 | Core | 1.0 | - | 102 |
| TC103 | should handle CSV write error | 305 | Core, Recent-Direct, Repair-Direct, Chronic, Config | 1.4 | 0.58 | 103 |
| TC104 | should verify CSV export calls correct database queries | 330 | Core, Recent-Direct, Chronic | 1.2 | 0.58 | 104 |
| TC105 | should create temp directory if it does not exist | 355 | Core, Config | 1.1 | - | 105 |
| TC106 | should not create temp directory if it exists | 381 | Core, Config | 1.1 | - | 106 |
| TC107 | should handle database error when fetching work entries for PDF | 408 | Core, Recent-Direct, Chronic, Config | 1.3 | 0.58 | 107 |
| TC108 | should verify PDF export calls correct database queries | 423 | Core, Recent-Direct, Chronic | 1.2 | 0.58 | 108 |

### Error Handler Middleware (middleware/errorHandler.test.js) - 8 TCs

| TC ID | TC Name | Line | Classifications | Priority Score | Chronic Score | Execution Priority |
|-------|---------|------|----------------|---------------|--------------|-------------------|
| TC109 | should handle Joi validation error | 23 | Unclassified | 0.1 | - | 145 |
| TC110 | should handle single Joi validation error | 41 | Unclassified | 0.1 | - | 146 |
| TC111 | should handle SQLITE_CONSTRAINT error | 58 | Config | 0.6 | - | 147 |
| TC112 | should handle SQLITE_ERROR | 73 | Config | 0.6 | - | 148 |
| TC113 | should handle error with custom status | 90 | Unclassified | 0.1 | - | 149 |
| TC114 | should default to 500 status if not specified | 104 | Unclassified | 0.1 | - | 150 |
| TC115 | should use default message if none provided | 117 | Unclassified | 0.1 | - | 151 |
| TC116 | should log error to console | 130 | Unclassified | 0.1 | - | 152 |

### Database Init (database/init.test.js) - 13 TCs

| TC ID | TC Name | Line | Classifications | Priority Score | Chronic Score | Execution Priority |
|-------|---------|------|----------------|---------------|--------------|-------------------|
| TC117 | should create and return database instance | 42 | Core, Config, Recent-Direct, Repair-Direct | 1.3 | - | 109 |
| TC118 | should return same database instance on multiple calls | 49 | Core, Config | 1.1 | - | 110 |
| TC119 | should handle database connection error | 56 | Core, Config | 1.1 | - | 111 |
| TC120 | should create all required tables | 78 | Core | 1.0 | - | 112 |
| TC121 | should create indexes for performance | 94 | Core | 1.0 | - | 113 |
| TC122 | should log success message | 107 | Unclassified | 0.1 | - | 153 |
| TC123 | should resolve promise on success | 113 | Core | 1.0 | - | 114 |
| TC124 | should close database connection | 119 | Core, Config | 1.1 | - | 115 |
| TC125 | should handle close error gracefully | 127 | Core, Config | 1.1 | - | 116 |
| TC126 | should handle multiple close calls safely | 136 | Core | 1.0 | - | 117 |
| TC127 | users table should have correct structure | 148 | Core | 1.0 | - | 118 |
| TC128 | clients table should have foreign key to users | 161 | Core | 1.0 | - | 119 |
| TC129 | work_entries table should have foreign keys | 174 | Core | 1.0 | - | 120 |

### Input Validation (validation/schemas.test.js) - 32 TCs

| TC ID | TC Name | Line | Classifications | Priority Score | Chronic Score | Execution Priority |
|-------|---------|------|----------------|---------------|--------------|-------------------|
| TC130 | should validate valid client data | 11 | Recent-Direct, Repair-Indirect | 0.9 | - | 121 |
| TC131 | should allow empty description | 21 | Recent-Direct | 0.8 | - | 122 |
| TC132 | should allow missing description | 31 | Recent-Direct | 0.8 | - | 123 |
| TC133 | should reject missing name | 40 | Recent-Direct | 0.8 | - | 124 |
| TC134 | should reject empty name | 49 | Recent-Direct | 0.8 | - | 125 |
| TC135 | should reject name longer than 255 characters | 59 | Recent-Direct | 0.8 | - | 126 |
| TC136 | should reject description longer than 1000 characters | 68 | Recent-Direct | 0.8 | - | 127 |
| TC137 | should trim whitespace from name | 78 | Recent-Direct | 0.8 | - | 128 |
| TC138 | should validate valid work entry | 89 | Recent-Direct, Repair-Direct | 0.9 | - | 129 |
| TC139 | should allow empty description (work entry) | 101 | Recent-Direct | 0.8 | - | 130 |
| TC140 | should reject missing clientId | 113 | Recent-Direct | 0.8 | - | 131 |
| TC141 | should reject negative clientId | 123 | Recent-Direct | 0.8 | - | 132 |
| TC142 | should reject zero clientId | 134 | Recent-Direct | 0.8 | - | 133 |
| TC143 | should reject missing hours | 145 | Recent-Direct | 0.8 | - | 134 |
| TC144 | should reject negative hours | 155 | Recent-Direct, Repair-Direct | 0.9 | - | 135 |
| TC145 | should reject hours greater than 24 | 166 | Recent-Direct | 0.8 | - | 136 |
| TC146 | should accept decimal hours | 177 | Recent-Direct | 0.8 | - | 137 |
| TC147 | should reject missing date | 188 | Recent-Direct | 0.8 | - | 138 |
| TC148 | should reject invalid date format | 198 | Recent-Direct | 0.8 | - | 139 |
| TC149 | should validate partial update (updateWorkEntrySchema) | 211 | Recent-Direct | 0.8 | - | 140 |
| TC150 | should validate multiple field update (updateWorkEntrySchema) | 220 | Recent-Direct | 0.8 | - | 141 |
| TC151 | should reject empty update (updateWorkEntrySchema) | 230 | Recent-Direct | 0.8 | - | 142 |
| TC152 | should validate clientId update (updateWorkEntrySchema) | 237 | Recent-Direct | 0.8 | - | 143 |
| TC153 | should validate date update (updateWorkEntrySchema) | 246 | Recent-Direct | 0.8 | - | 144 |
| TC154 | should validate name update (updateClientSchema) | 257 | Recent-Direct | 0.8 | - | 154 |
| TC155 | should validate description update (updateClientSchema) | 266 | Recent-Direct | 0.8 | - | 155 |
| TC156 | should reject empty update (updateClientSchema) | 275 | Recent-Direct | 0.8 | - | 156 |
| TC157 | should validate both fields update (updateClientSchema) | 282 | Recent-Direct | 0.8 | - | 157 |
| TC158 | should validate valid email | 294 | Recent-Direct | 0.8 | - | 158 |
| TC159 | should reject invalid email | 303 | Recent-Direct | 0.8 | - | 159 |
| TC160 | should reject missing email (emailSchema) | 312 | Recent-Direct | 0.8 | - | 160 |
| TC161 | should accept email with subdomain | 319 | Recent-Direct | 0.8 | - | 161 |

## Per-TC Reasoning Summary

Every TC has been classified with an auditable reasoning string. Key patterns:

- **Core + Recent-Direct + Repair-Direct** (highest priority): TCs covering auth, client delete cascade, and work entry creation that were directly modified by bug-fix PRs in the v3.1.0 release
- **Core + Chronic + Config** (high priority): Report export TCs with historically high failure rates and environment-sensitive file I/O
- **Recent-Direct** (medium priority): Validation schema TCs covering files changed in the release
- **Unclassified** (lowest priority): Error handler utility TCs and logging tests not tied to business-critical features

Full per-TC reasoning strings are available in the companion JSON file: `rcrcr-classification-matrix.json`
