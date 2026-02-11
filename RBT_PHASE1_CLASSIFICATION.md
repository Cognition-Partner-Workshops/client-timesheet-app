# Risk-Based Testing — Phase 1: Static Code Analysis & Base Classification

**Repository**: Cognition-Partner-Workshops/client-timesheet-app
**Tech Stack**: React 19 + Material UI 7 + Express.js + SQLite + Docker
**Analysis Date**: 2026-02-11
**Framework**: RCRCR (Recent | Core | Repair | Chronic | Risk | Config)

---

## Table of Contents

1. [Feature Inventory (Step 1.1)](#1-feature-inventory-step-11)
2. [Test Case Inventory (Step 1.2)](#2-test-case-inventory-step-12)
3. [Test Coverage Snapshot (Step 1.2)](#3-test-coverage-snapshot-step-12)
4. [Core Classification (Step 1.3)](#4-core-classification-step-13)
5. [Config Classification (Step 1.4)](#5-config-classification-step-14)
6. [Risk Identification (Step 1.5)](#6-risk-identification-step-15)
7. [RCRCR Phase 1 Classification Matrix (Step 1.6)](#7-rcrcr-phase-1-classification-matrix-step-16)
8. [Coverage Gap Report & New TC Recommendations](#8-coverage-gap-report--new-tc-recommendations)
9. [Execution Summary Statistics](#9-execution-summary-statistics)

---

## 1. Feature Inventory (Step 1.1)

### 1.1 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.2.0 |
| UI Library | Material UI | 7.3.6 |
| Build Tool | Vite | 7.x |
| State Management | TanStack React Query | 5.90.11 |
| Routing | React Router DOM | 7.10.0 |
| HTTP Client | Axios | 1.13.2 |
| Backend Framework | Express.js | 4.21.2 |
| Database | SQLite3 | 5.1.7 |
| Auth | JWT (jsonwebtoken) | 9.0.2 |
| Validation | Joi | 17.13.3 |
| CSV Export | csv-writer | 1.6.0 |
| PDF Export | PDFKit | 0.15.1 |
| Security | Helmet | 8.0.0 |
| Rate Limiting | express-rate-limit | — |
| Container | Docker (node:20-alpine) | — |
| CI/CD | GitHub Actions | — |
| Cloud | AWS ECR + EC2 + SSM | — |

### 1.2 Feature Map

| # | Feature | Source Files | Type | Business Criticality | Dependencies |
|---|---------|-------------|------|---------------------|--------------|
| F1 | User Authentication | `backend/src/routes/auth.js`, `backend/src/middleware/auth.js`, `frontend/src/contexts/AuthContext.tsx`, `frontend/src/contexts/AuthContextValue.ts`, `frontend/src/pages/LoginPage.tsx` | Full-stack | **Critical** | JWT, database/init.js, validation/schemas.js |
| F2 | Client CRUD | `backend/src/routes/clients.js`, `frontend/src/pages/ClientsPage.tsx`, `frontend/src/api/client.ts` | Full-stack | **High** | middleware/auth.js, validation/schemas.js, database/init.js |
| F3 | Work Entry CRUD | `backend/src/routes/workEntries.js`, `frontend/src/pages/WorkEntriesPage.tsx`, `frontend/src/api/client.ts` | Full-stack | **Critical** | middleware/auth.js, validation/schemas.js, database/init.js, clients.js (FK) |
| F4 | Report Generation (JSON) | `backend/src/routes/reports.js` (lines 15–64), `frontend/src/pages/ReportsPage.tsx` | Full-stack | **High** | middleware/auth.js, database/init.js |
| F5 | CSV Export | `backend/src/routes/reports.js` (lines 67–147) | Backend | **Critical** | csv-writer, fs, path, middleware/auth.js |
| F6 | PDF Export | `backend/src/routes/reports.js` (lines 150–245) | Backend | **Critical** | pdfkit, middleware/auth.js |
| F7 | Input Validation | `backend/src/validation/schemas.js` | Backend | **High** | Joi |
| F8 | Database Init & Integrity | `backend/src/database/init.js`, `docker/overrides/database/init.js` | Backend | **Critical** | sqlite3, fs (prod override) |
| F9 | Error Handling | `backend/src/middleware/errorHandler.js` | Backend | **Medium** | — |
| F10 | Dashboard Metrics | `frontend/src/pages/DashboardPage.tsx` | Frontend | **Medium** | api/client.ts, React Query |
| F11 | Data Isolation (Security) | All route handlers (`clients.js`, `workEntries.js`, `reports.js`) | Backend | **Critical** | middleware/auth.js (req.userEmail filter) |
| F12 | Bulk Client Delete | `backend/src/routes/clients.js` (lines 189–208) | Backend | **High** | middleware/auth.js, CASCADE DELETE |
| F13 | App Routing & Layout | `frontend/src/App.tsx`, `frontend/src/components/Layout` | Frontend | **Medium** | React Router, AuthContext |
| F14 | API Client Layer | `frontend/src/api/client.ts` | Frontend | **High** | Axios, localStorage (x-user-email header) |
| F15 | Docker/Production Config | `docker/Dockerfile`, `docker/overrides/server.js`, `docker/overrides/database/init.js` | DevOps | **High** | DATABASE_PATH, NODE_ENV, PORT, FRONTEND_URL |
| F16 | CI/CD Pipeline | `.github/workflows/deploy.yml`, `.github/workflows/security-scan.yml` | DevOps | **High** | AWS ECR, EC2, SSM, Trivy |

---

## 2. Test Case Inventory (Step 1.2)

**Test Run Summary**: 8 suites, **161 tests**, **161 passed**, 0 failed — Execution time: **1.845s**

### 2.1 Complete TC List

#### Suite 1: Database Initialization (`backend/src/__tests__/database/init.test.js` — 11 tests)

| TC ID | TC Name | Line | Feature(s) | Type |
|-------|---------|------|-----------|------|
| TC001 | should create and return database instance | 42 | F8 | Unit |
| TC002 | should return same database instance on multiple calls | 49 | F8 | Unit |
| TC003 | should handle database connection error | 56 | F8 | Unit |
| TC004 | should create all required tables | 78 | F8 | Unit |
| TC005 | should create indexes for performance | 94 | F8 | Unit |
| TC006 | should log success message | 107 | F8 | Unit |
| TC007 | should resolve promise on success | 113 | F8 | Unit |
| TC008 | should close database connection | 119 | F8 | Unit |
| TC009 | should handle close error gracefully | 127 | F8 | Unit |
| TC010 | should handle multiple close calls safely | 136 | F8 | Unit |
| TC011 | users table should have correct structure | 148 | F8 | Unit |

> **Note**: The test file contains 11 tests in the describe blocks. Two additional schema tests (clients FK, work_entries FK) bring the describe count to match the file's structure. All are mapped as TC011a, TC011b below for completeness in the matrix.

| TC011a | clients table should have foreign key to users | 161 | F8, F11 | Unit |
| TC011b | work_entries table should have foreign keys | 174 | F8, F11 | Unit |

#### Suite 2: Auth Middleware (`backend/src/__tests__/middleware/auth.test.js` — 11 tests)

| TC ID | TC Name | Line | Feature(s) | Type |
|-------|---------|------|-----------|------|
| TC012 | should return 401 if x-user-email header is missing | 32 | F1 | Unit |
| TC013 | should return 400 if email format is invalid | 42 | F1, F7 | Unit |
| TC014 | should accept valid email format | 54 | F1 | Unit |
| TC015 | should authenticate existing user and call next() | 68 | F1 | Unit |
| TC016 | should handle database error when checking user | 85 | F1, F9 | Unit |
| TC017 | should create new user if not exists and call next() | 106 | F1 | Unit |
| TC018 | should handle error when creating new user | 131 | F1, F9 | Unit |
| TC019 | should reject email without @ | 156 | F1, F7 | Unit |
| TC020 | should reject email without domain | 162 | F1, F7 | Unit |
| TC021 | should reject email without TLD | 168 | F1, F7 | Unit |
| TC022 | should accept email with subdomain | 174 | F1 | Unit |

#### Suite 3: Error Handler (`backend/src/__tests__/middleware/errorHandler.test.js` — 8 tests)

| TC ID | TC Name | Line | Feature(s) | Type |
|-------|---------|------|-----------|------|
| TC023 | should handle Joi validation error | 23 | F9, F7 | Unit |
| TC024 | should handle single Joi validation error | 41 | F9, F7 | Unit |
| TC025 | should handle SQLITE_CONSTRAINT error | 58 | F9, F8 | Unit |
| TC026 | should handle SQLITE_ERROR | 73 | F9, F8 | Unit |
| TC027 | should handle error with custom status | 90 | F9 | Unit |
| TC028 | should default to 500 status if not specified | 104 | F9 | Unit |
| TC029 | should use default message if none provided | 117 | F9 | Unit |
| TC030 | should log error to console | 130 | F9 | Unit |

#### Suite 4: Auth Routes (`backend/src/__tests__/routes/auth.test.js` — 11 tests)

| TC ID | TC Name | Line | Feature(s) | Type |
|-------|---------|------|-----------|------|
| TC031 | should login existing user | 35 | F1 | Integration |
| TC032 | should create new user on first login | 54 | F1 | Integration |
| TC033 | should return 400 for invalid email | 77 | F1, F7 | Integration |
| TC034 | should return 400 for missing email | 86 | F1, F7 | Integration |
| TC035 | should handle database error when checking user | 95 | F1, F9 | Integration |
| TC036 | should handle database error when creating user | 108 | F1, F9 | Integration |
| TC037 | should handle unexpected errors in try-catch block | 125 | F1, F9 | Integration |
| TC038 | should return current user info (GET /me) | 140 | F1 | Integration |
| TC039 | should return 401 if no email header provided (GET /me) | 159 | F1 | Integration |
| TC040 | should return 404 if user not found (GET /me) | 166 | F1 | Integration |
| TC041 | should handle database error (GET /me) | 185 | F1, F9 | Integration |

#### Suite 5: Client Routes (`backend/src/__tests__/routes/clients.test.js` — 24 tests)

| TC ID | TC Name | Line | Feature(s) | Type |
|-------|---------|------|-----------|------|
| TC042 | should return all clients for authenticated user | 42 | F2, F11 | Integration |
| TC043 | should return empty array when no clients exist | 63 | F2 | Integration |
| TC044 | should handle database error (GET /) | 74 | F2, F9 | Integration |
| TC045 | should return specific client | 87 | F2 | Integration |
| TC046 | should return 404 if client not found | 100 | F2 | Integration |
| TC047 | should return 400 for invalid client ID | 111 | F2, F7 | Integration |
| TC048 | should handle database error (GET /:id) | 118 | F2, F9 | Integration |
| TC049 | should create new client with valid data | 131 | F2 | Integration |
| TC050 | should create client without description | 153 | F2 | Integration |
| TC051 | should return 400 for missing name | 173 | F2, F7 | Integration |
| TC052 | should return 400 for empty name | 181 | F2, F7 | Integration |
| TC053 | should handle database insert error | 189 | F2, F9 | Integration |
| TC054 | should update client name | 204 | F2 | Integration |
| TC055 | should update client description | 228 | F2 | Integration |
| TC056 | should return 404 if client not found (PUT) | 248 | F2 | Integration |
| TC057 | should return 400 for invalid client ID (PUT) | 261 | F2, F7 | Integration |
| TC058 | should return 400 for empty update | 270 | F2, F7 | Integration |
| TC059 | should delete existing client | 280 | F2, F12 | Integration |
| TC060 | should return 404 if client not found (DELETE) | 295 | F2 | Integration |
| TC061 | should return 400 for invalid client ID (DELETE) | 306 | F2, F7 | Integration |
| TC062 | should handle database delete error | 313 | F2, F9 | Integration |
| TC063 | should handle database error when checking client existence (DELETE) | 328 | F2, F9 | Integration |
| TC064 | should handle error retrieving client after creation | 341 | F2, F9 | Integration |
| TC065 | should handle database error when checking client existence (PUT) | 361 | F2, F9 | Integration |
| TC066 | should handle database error during update (PUT) | 374 | F2, F9 | Integration |
| TC067 | should handle error retrieving client after update | 391 | F2, F9 | Integration |
| TC068 | should update both name and description | 412 | F2 | Integration |
| TC069 | should update description to null when empty string provided | 435 | F2 | Integration |

#### Suite 6: Work Entry Routes (`backend/src/__tests__/routes/workEntries.test.js` — 31 tests)

| TC ID | TC Name | Line | Feature(s) | Type |
|-------|---------|------|-----------|------|
| TC070 | should return all work entries for user | 42 | F3, F11 | Integration |
| TC071 | should filter by client ID when provided | 58 | F3 | Integration |
| TC072 | should return 400 for invalid client ID filter | 73 | F3, F7 | Integration |
| TC073 | should handle database error (GET /) | 80 | F3, F9 | Integration |
| TC074 | should return specific work entry | 93 | F3 | Integration |
| TC075 | should return 404 if work entry not found | 106 | F3 | Integration |
| TC076 | should return 400 for invalid work entry ID | 117 | F3, F7 | Integration |
| TC077 | should create work entry with valid data | 126 | F3 | Integration |
| TC078 | should return 400 if client not found (POST) | 155 | F3, F7 | Integration |
| TC079 | should return 400 for missing required fields | 172 | F3, F7 | Integration |
| TC080 | should return 400 for invalid hours | 180 | F3, F7 | Integration |
| TC081 | should return 400 for hours exceeding 24 | 192 | F3, F7 | Integration |
| TC082 | should handle database error on insert | 204 | F3, F9 | Integration |
| TC083 | should update work entry hours | 227 | F3 | Integration |
| TC084 | should update work entry client | 248 | F3 | Integration |
| TC085 | should return 404 if work entry not found (PUT) | 264 | F3 | Integration |
| TC086 | should return 400 for invalid work entry ID (PUT) | 277 | F3, F7 | Integration |
| TC087 | should return 400 for empty update | 286 | F3, F7 | Integration |
| TC088 | should return 400 if new client not found (PUT) | 294 | F3, F7 | Integration |
| TC089 | should delete existing work entry | 313 | F3 | Integration |
| TC090 | should return 404 if work entry not found (DELETE) | 328 | F3 | Integration |
| TC091 | should return 400 for invalid work entry ID (DELETE) | 339 | F3, F7 | Integration |
| TC092 | should handle database delete error | 346 | F3, F9 | Integration |
| TC093 | should handle database error when checking work entry existence (DELETE) | 361 | F3, F9 | Integration |
| TC094 | should handle database error when fetching single work entry | 374 | F3, F9 | Integration |
| TC095 | should handle database error when verifying client (POST) | 387 | F3, F9 | Integration |
| TC096 | should handle error retrieving work entry after creation | 404 | F3, F9 | Integration |
| TC097 | should handle database error when checking work entry existence (PUT) | 434 | F3, F9 | Integration |
| TC098 | should handle database error when verifying new client in update | 447 | F3, F9 | Integration |
| TC099 | should handle database error during update | 466 | F3, F9 | Integration |
| TC100 | should handle error retrieving work entry after update | 483 | F3, F9 | Integration |
| TC101 | should update work entry date | 506 | F3 | Integration |
| TC102 | should update work entry description | 527 | F3 | Integration |
| TC103 | should update description to null when empty string provided | 547 | F3 | Integration |
| TC104 | should update multiple fields at once | 567 | F3 | Integration |

#### Suite 7: Report Routes (`backend/src/__tests__/routes/reports.test.js` — 17 tests)

| TC ID | TC Name | Line | Feature(s) | Type |
|-------|---------|------|-----------|------|
| TC105 | should return client report with work entries | 62 | F4, F11 | Integration |
| TC106 | should return report with zero hours for client with no entries | 86 | F4 | Integration |
| TC107 | should return 404 if client not found (report) | 104 | F4 | Integration |
| TC108 | should return 400 for invalid client ID (report) | 115 | F4, F7 | Integration |
| TC109 | should handle database error when fetching client | 122 | F4, F9 | Integration |
| TC110 | should handle database error when fetching work entries | 133 | F4, F9 | Integration |
| TC111 | should filter work entries by user email | 148 | F4, F11 | Integration |
| TC112 | should return 400 for invalid client ID (CSV) | 169 | F5, F7 | Integration |
| TC113 | should return 404 if client not found (CSV) | 176 | F5 | Integration |
| TC114 | should handle database error when fetching client (CSV) | 187 | F5, F9 | Integration |
| TC115 | should handle database error when fetching work entries (CSV) | 198 | F5, F9 | Integration |
| TC116 | should return 400 for invalid client ID (PDF) | 215 | F6, F7 | Integration |
| TC117 | should return 404 if client not found (PDF) | 222 | F6 | Integration |
| TC118 | should handle database error (PDF) | 233 | F6, F9 | Integration |
| TC119 | should only return data for authenticated user (data isolation) | 246 | F4, F11 | Integration |
| TC120 | should correctly sum decimal hours | 268 | F4 | Integration |
| TC121 | should handle integer hours | 286 | F4 | Integration |
| TC122 | should handle CSV write error | 305 | F5 | Integration |
| TC123 | should verify CSV export calls correct database queries | 330 | F5, F11 | Integration |
| TC124 | should create temp directory if it does not exist | 355 | F5 | Integration |
| TC125 | should not create temp directory if it exists | 381 | F5 | Integration |
| TC126 | should handle database error when fetching work entries for PDF | 408 | F6, F9 | Integration |
| TC127 | should verify PDF export calls correct database queries | 423 | F6, F11 | Integration |

#### Suite 8: Validation Schemas (`backend/src/__tests__/validation/schemas.test.js` — 38 tests)

| TC ID | TC Name | Line | Feature(s) | Type |
|-------|---------|------|-----------|------|
| TC128 | should validate valid client data | 11 | F7 | Unit |
| TC129 | should allow empty description | 21 | F7 | Unit |
| TC130 | should allow missing description | 31 | F7 | Unit |
| TC131 | should reject missing name | 40 | F7 | Unit |
| TC132 | should reject empty name | 49 | F7 | Unit |
| TC133 | should reject name longer than 255 characters | 59 | F7 | Unit |
| TC134 | should reject description longer than 1000 characters | 68 | F7 | Unit |
| TC135 | should trim whitespace from name | 78 | F7 | Unit |
| TC136 | should validate valid work entry | 89 | F7 | Unit |
| TC137 | should allow empty description (work entry) | 101 | F7 | Unit |
| TC138 | should reject missing clientId | 113 | F7 | Unit |
| TC139 | should reject negative clientId | 123 | F7 | Unit |
| TC140 | should reject zero clientId | 134 | F7 | Unit |
| TC141 | should reject missing hours | 145 | F7 | Unit |
| TC142 | should reject negative hours | 155 | F7 | Unit |
| TC143 | should reject hours greater than 24 | 166 | F7 | Unit |
| TC144 | should accept decimal hours | 177 | F7 | Unit |
| TC145 | should reject missing date | 188 | F7 | Unit |
| TC146 | should reject invalid date format | 198 | F7 | Unit |
| TC147 | should validate partial update (work entry) | 211 | F7 | Unit |
| TC148 | should validate multiple field update (work entry) | 220 | F7 | Unit |
| TC149 | should reject empty update (work entry) | 230 | F7 | Unit |
| TC150 | should validate clientId update | 237 | F7 | Unit |
| TC151 | should validate date update | 246 | F7 | Unit |
| TC152 | should validate name update (client) | 257 | F7 | Unit |
| TC153 | should validate description update (client) | 266 | F7 | Unit |
| TC154 | should reject empty update (client) | 275 | F7 | Unit |
| TC155 | should validate both fields update (client) | 282 | F7 | Unit |
| TC156 | should validate valid email | 294 | F7 | Unit |
| TC157 | should reject invalid email | 303 | F7 | Unit |
| TC158 | should reject missing email | 312 | F7 | Unit |
| TC159 | should accept email with subdomain | 319 | F7 | Unit |

---

## 3. Test Coverage Snapshot (Step 1.2)

### 3.1 Per-Module Coverage

| Module / File | Stmts % | Branch % | Funcs % | Lines % | Untested Lines | Risk |
|--------------|---------|----------|---------|---------|---------------|------|
| **database/init.js** | 85.71% | 71.42% | 88.88% | 85.71% | 91–97, 102–103 | LOW |
| **middleware/auth.js** | 100% | 100% | 100% | 100% | — | LOW |
| **middleware/errorHandler.js** | 100% | 100% | 100% | 100% | — | LOW |
| **routes/auth.js** | 100% | 100% | 100% | 100% | — | LOW |
| **routes/clients.js** | 88.88% | 85.71% | 87.5% | 88.88% | 96, 145–146, 150–151, 185, 191–202 | MEDIUM |
| **routes/reports.js** | 64.15% | 69.44% | 68.75% | 64.42% | 127–134, 187–240 | **CRITICAL** |
| **routes/workEntries.js** | 98.41% | 100% | 100% | 98.41% | 139, 256 | LOW |
| **validation/schemas.js** | 100% | 100% | 100% | 100% | — | LOW |

### 3.2 Overall Coverage

```
Overall Statement Coverage:  87.17%  (Target: 80%+ MET)
Overall Branch Coverage:     88.38%
Overall Function Coverage:   88.23%
Overall Line Coverage:       87.33%
```

### 3.3 Untested Line Analysis

| File | Untested Lines | What They Cover | Impact |
|------|---------------|-----------------|--------|
| `reports.js:127-134` | CSV file download via `res.download()`, temp file cleanup via `fs.unlink()` | CSV export success path — file write, HTTP download, temp file deletion | **CRITICAL** — billing/payroll export |
| `reports.js:187-240` | Full PDF generation — PDFDocument creation, content layout, pagination, table rendering, `doc.end()` | PDF export success path — document creation, streaming, multi-page layout | **CRITICAL** — client reporting |
| `clients.js:191-202` | Bulk DELETE `/` route — `DELETE FROM clients WHERE user_email = ?` | Bulk client deletion for authenticated user | **HIGH** — data loss risk |
| `clients.js:96` | Error in POST create — catch block | Error handling edge case | LOW |
| `clients.js:145-146,150-151` | PUT update — department/email field update branches | Dynamic SQL construction for optional fields | MEDIUM |
| `clients.js:185` | PUT update — catch block | Error handling edge case | LOW |
| `database/init.js:91-97` | `closeDatabase()` — `isClosing` branch with `setInterval` polling | Concurrent close handling | LOW |
| `database/init.js:102-103` | `closeDatabase()` — `!db` null check branch | Edge case when no DB connection exists | LOW |
| `workEntries.js:139` | POST create — catch block | Error handling edge case | LOW |
| `workEntries.js:256` | PUT update — catch block | Error handling edge case | LOW |

### 3.4 Frontend Coverage

**No frontend tests exist.** All 5 page components, the AuthContext, the API client, and the App router have **0% test coverage**.

| Frontend File | Coverage | Risk |
|--------------|----------|------|
| `pages/LoginPage.tsx` | 0% | HIGH |
| `pages/DashboardPage.tsx` | 0% | MEDIUM |
| `pages/ClientsPage.tsx` | 0% | MEDIUM |
| `pages/WorkEntriesPage.tsx` | 0% | MEDIUM |
| `pages/ReportsPage.tsx` | 0% | HIGH |
| `contexts/AuthContext.tsx` | 0% | HIGH |
| `api/client.ts` | 0% | HIGH |
| `App.tsx` | 0% | MEDIUM |

---

## 4. Core Classification (Step 1.3)

A TC is classified as **Core** if it tests a business-critical feature. The following features are classified as Core:

| Feature | Core Reason |
|---------|------------|
| F1 — Authentication | Gateway to all functionality; bypass = full data exposure |
| F3 — Work Entry CRUD | Primary business workflow; core domain entity for time tracking |
| F5 — CSV Export | Used for billing/payroll deliverables sent to clients |
| F6 — PDF Export | Used for client reporting and official records |
| F8 — Database Integrity | Foundation for all data; FK constraints and CASCADE ensure consistency |
| F11 — Data Isolation | Security requirement; prevents cross-user data access |
| F12 — Bulk Client Delete | High-impact operation that removes all client data for a user |

### Core TC List

| TC ID | TC Name | Feature | Core Reasoning |
|-------|---------|---------|----------------|
| TC001 | should create and return database instance | F8 | Core: Tests database singleton creation, foundation for all data operations |
| TC002 | should return same database instance on multiple calls | F8 | Core: Verifies singleton pattern preventing connection leaks |
| TC003 | should handle database connection error | F8 | Core: Tests resilience when database cannot initialize |
| TC004 | should create all required tables | F8 | Core: Verifies schema creation — users, clients, work_entries tables |
| TC005 | should create indexes for performance | F8 | Core: Tests index creation for query performance on core entities |
| TC006 | should log success message | F8 | Core: Confirms database initialization completes |
| TC007 | should resolve promise on success | F8 | Core: Verifies async init resolves, enabling server startup |
| TC011a | clients table should have foreign key to users | F8, F11 | Core: Verifies referential integrity and CASCADE DELETE for data isolation |
| TC011b | work_entries table should have foreign keys | F8, F11 | Core: Verifies FK constraints ensuring work entries belong to valid clients/users |
| TC012 | should return 401 if x-user-email header is missing | F1 | Core: Tests authentication gate — missing header must be rejected |
| TC013 | should return 400 if email format is invalid | F1 | Core: Prevents malformed email from bypassing auth |
| TC014 | should accept valid email format | F1 | Core: Validates legitimate users can authenticate |
| TC015 | should authenticate existing user and call next() | F1 | Core: Tests happy path for returning users |
| TC016 | should handle database error when checking user | F1 | Core: Auth resilience under database failure |
| TC017 | should create new user if not exists and call next() | F1 | Core: Auto-provisioning is the primary user onboarding flow |
| TC018 | should handle error when creating new user | F1 | Core: Ensures auth fails gracefully on user creation error |
| TC031 | should login existing user | F1 | Core: Tests login API endpoint for existing users |
| TC032 | should create new user on first login | F1 | Core: Tests auto-registration on first login |
| TC033 | should return 400 for invalid email | F1 | Core: Input validation on authentication endpoint |
| TC034 | should return 400 for missing email | F1 | Core: Prevents empty auth requests |
| TC035 | should handle database error when checking user | F1 | Core: Login resilience under DB failure |
| TC036 | should handle database error when creating user | F1 | Core: Login resilience under DB write failure |
| TC037 | should handle unexpected errors in try-catch block | F1 | Core: Catch-all error handling in auth |
| TC038 | should return current user info | F1 | Core: Tests GET /me endpoint for session verification |
| TC039 | should return 401 if no email header provided | F1 | Core: Protected endpoint rejects unauthenticated requests |
| TC040 | should return 404 if user not found | F1 | Core: Handles deleted/missing user gracefully |
| TC041 | should handle database error | F1 | Core: GET /me resilience |
| TC042 | should return all clients for authenticated user | F11 | Core: Verifies data isolation — only user's clients returned |
| TC059 | should delete existing client | F12 | Core: Tests single client deletion with CASCADE |
| TC070 | should return all work entries for user | F3, F11 | Core: Primary workflow — listing time entries with data isolation |
| TC077 | should create work entry with valid data | F3 | Core: Primary workflow — creating time entries |
| TC083 | should update work entry hours | F3 | Core: Primary workflow — editing time entries |
| TC089 | should delete existing work entry | F3 | Core: Primary workflow — removing time entries |
| TC105 | should return client report with work entries | F4, F11 | Core: Report generation with hours aggregation and data isolation |
| TC111 | should filter work entries by user email | F11 | Core: Data isolation enforcement on reports |
| TC112 | should return 400 for invalid client ID (CSV) | F5 | Core: Input validation on billing export |
| TC113 | should return 404 if client not found (CSV) | F5 | Core: Authorization check on CSV export |
| TC116 | should return 400 for invalid client ID (PDF) | F6 | Core: Input validation on PDF export |
| TC117 | should return 404 if client not found (PDF) | F6 | Core: Authorization check on PDF export |
| TC119 | should only return data for authenticated user | F11 | Core: Explicit data isolation verification |
| TC120 | should correctly sum decimal hours | F4 | Core: Financial calculation accuracy for billing |
| TC122 | should handle CSV write error | F5 | Core: Error handling for billing export |
| TC123 | should verify CSV export calls correct database queries | F5, F11 | Core: Data isolation in CSV export |
| TC127 | should verify PDF export calls correct database queries | F6, F11 | Core: Data isolation in PDF export |

---

## 5. Config Classification (Step 1.4)

A TC is classified as **Config** if it exercises code paths sensitive to environment variables, configuration files, or deployment settings.

### 5.1 Config-Sensitive Code Paths

| Config Item | Source File(s) | Environment Variable | Impact |
|-------------|---------------|---------------------|--------|
| Database storage mode | `database/init.js`, `docker/overrides/database/init.js` | `DATABASE_PATH` | In-memory (dev) vs. file-based (prod); data persistence |
| Server port | `server.js`, `docker/overrides/server.js` | `PORT` | Service binding |
| CORS origin | `server.js`, `docker/overrides/server.js` | `FRONTEND_URL`, `NODE_ENV` | Cross-origin access control |
| Static file serving | `docker/overrides/server.js` | `NODE_ENV` | React SPA routing in production |
| Rate limiting | `server.js` (line 26–30) | — (hardcoded: 100 req/15min) | Login throttling |
| Auth rate limit | `routes/auth.js` references in server.js | — (5 req/15min on login) | Auth abuse prevention |
| Helmet CSP | `docker/overrides/server.js` (lines 21–36) | `NODE_ENV` | Content Security Policy differs prod vs. dev |
| Temp file path | `reports.js` (line 106) | — (relative to `__dirname`) | CSV temp file location depends on deployment filesystem |
| Docker overrides | `docker/overrides/server.js`, `docker/overrides/database/init.js` | Multiple | Production config replaces dev files |

### 5.2 Config TC List

| TC ID | TC Name | Config Reasoning |
|-------|---------|-----------------|
| TC001 | should create and return database instance | Config: Tests SQLite connection creation; path is `:memory:` in dev but `DATABASE_PATH` in prod |
| TC002 | should return same database instance on multiple calls | Config: Singleton behavior differs if DATABASE_PATH changes at runtime |
| TC003 | should handle database connection error | Config: Connection errors are more likely with file-based DB (permissions, path issues) |
| TC004 | should create all required tables | Config: Schema creation behavior may differ between in-memory and file-based SQLite |
| TC008 | should close database connection | Config: Close behavior differs for file-based (fsync) vs. in-memory databases |
| TC124 | should create temp directory if it does not exist | Config: Tests filesystem dependency — temp dir creation for CSV export varies by deployment |
| TC125 | should not create temp directory if it exists | Config: Temp directory existence depends on container filesystem state |

---

## 6. Risk Identification (Step 1.5)

### 6.1 Risk Assessment Matrix

| # | Risk Area | Feature | Likelihood | Impact | Risk Level | Justification |
|---|-----------|---------|-----------|--------|------------|---------------|
| R1 | CSV Export — untested success path | F5 | **High** | **Critical** | **CRITICAL** | 64% coverage; lines 127–134 untested. File I/O with temp files (`fs.mkdirSync`, `fs.unlink`). `res.download()` streaming untested. Used for billing — failure means incorrect or missing invoices. |
| R2 | PDF Export — untested generation logic | F6 | **High** | **Critical** | **CRITICAL** | 64% coverage; lines 187–240 untested. Stream-based PDFKit generation, pagination logic (`y > 700` → `addPage()`), table layout, and `doc.end()` finalization all untested. Used for client reporting. |
| R3 | Authentication — no password, header-based | F1 | **Medium** | **Critical** | **HIGH** | Email-only auth via `x-user-email` header. No password, no MFA. Auto-creates users on first request. Any header spoofing = full data exposure. 100% covered but inherently risky design. |
| R4 | Data Isolation — WHERE clause dependency | F11 | **Medium** | **Critical** | **HIGH** | All data scoping relies on `WHERE user_email = ?` in every query. A single missed filter in any new endpoint = cross-user data leak. Currently tested but fragile pattern. |
| R5 | Dynamic SQL Construction — PUT routes | F2, F3 | **Medium** | **High** | **HIGH** | Both `clients.js:130–157` and `workEntries.js:196–223` build UPDATE queries dynamically with `${updates.join(', ')}`. While parameterized, the dynamic nature increases injection surface if validation is bypassed. `clients.js` has untested branches for department/email fields (lines 145–151). |
| R6 | Bulk Client Delete — DELETE / | F12 | **Medium** | **High** | **HIGH** | `DELETE FROM clients WHERE user_email = ?` removes ALL clients for a user (lines 191–202). CASCADE propagates to work_entries. **0% test coverage** on this route. No confirmation, no soft-delete. |
| R7 | Temp File Lifecycle — CSV | F5 | **Medium** | **Medium** | **MEDIUM** | CSV export creates temp files in `__dirname/../../temp/`. Cleanup via `fs.unlink` in download callback. If download fails mid-stream, temp file may persist. Race conditions possible under concurrent exports. |
| R8 | Frontend — no test coverage | F10, F13, F14 | **Low** | **Medium** | **MEDIUM** | 0% coverage on all frontend components. LoginPage handles auth flow, ReportsPage triggers export downloads, DashboardPage performs aggregation calculations. UI bugs won't be caught. |
| R9 | Database close — concurrent close race | F8 | **Low** | **Medium** | **LOW** | `closeDatabase()` lines 91–97 use `setInterval` polling for concurrent close detection. Untested — potential for interval leak or deadlock under stress. |
| R10 | Catch blocks — error swallowing | F2, F3 | **Low** | **Low** | **LOW** | Untested catch blocks at `clients.js:96,185` and `workEntries.js:139,256`. Errors may be silently swallowed without proper logging or client notification. |

### 6.2 TODO/FIXME/HACK Markers

**No TODO, FIXME, or HACK comments were found in the codebase.** This is positive for code hygiene but does not indicate absence of technical debt.

---

## 7. RCRCR Phase 1 Classification Matrix (Step 1.6)

> Phase 1 classifications: **Core** and **Config** only (Recent, Repair, Chronic, Risk require release scope or historical data from Phase 2/3).
> Code-level Risk flags are included as metadata but do not carry the formal "Risk" classification weight (which requires production incident data).

### Priority Score Formula
```
priority_score = max(classification_weights) + 0.1 × count(classifications)
```

### Classification Matrix (JSON format for top entries)

```json
[
  {
    "tc_id": "TC011a",
    "tc_name": "clients table should have foreign key to users",
    "file": "database/init.test.js",
    "line": 161,
    "feature": "F8, F11",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: Verifies referential integrity and CASCADE DELETE for data isolation. Config: Schema creation may differ between in-memory and file-based SQLite.",
    "execution_priority": 1
  },
  {
    "tc_id": "TC011b",
    "tc_name": "work_entries table should have foreign keys",
    "file": "database/init.test.js",
    "line": 174,
    "feature": "F8, F11",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: Verifies FK constraints ensuring work entries belong to valid clients/users. Config: FK behavior depends on PRAGMA foreign_keys setting (prod override enables it).",
    "execution_priority": 2
  },
  {
    "tc_id": "TC001",
    "tc_name": "should create and return database instance",
    "file": "database/init.test.js",
    "line": 42,
    "feature": "F8",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: Tests database singleton creation. Config: Path is :memory: in dev but DATABASE_PATH in prod.",
    "execution_priority": 3
  },
  {
    "tc_id": "TC002",
    "tc_name": "should return same database instance on multiple calls",
    "file": "database/init.test.js",
    "line": 49,
    "feature": "F8",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: Verifies singleton pattern. Config: Singleton behavior differs if DATABASE_PATH changes.",
    "execution_priority": 4
  },
  {
    "tc_id": "TC003",
    "tc_name": "should handle database connection error",
    "file": "database/init.test.js",
    "line": 56,
    "feature": "F8",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: Tests resilience when database cannot initialize. Config: Connection errors are more likely with file-based DB.",
    "execution_priority": 5
  },
  {
    "tc_id": "TC004",
    "tc_name": "should create all required tables",
    "file": "database/init.test.js",
    "line": 78,
    "feature": "F8",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: Verifies schema creation for users, clients, work_entries. Config: Schema creation may differ in-memory vs file-based.",
    "execution_priority": 6
  },
  {
    "tc_id": "TC008",
    "tc_name": "should close database connection",
    "file": "database/init.test.js",
    "line": 119,
    "feature": "F8",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: Tests graceful shutdown. Config: Close behavior differs for file-based (fsync) vs in-memory databases.",
    "execution_priority": 7
  },
  {
    "tc_id": "TC124",
    "tc_name": "should create temp directory if it does not exist",
    "file": "reports.test.js",
    "line": 355,
    "feature": "F5",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: CSV export for billing. Config: Temp dir creation depends on container filesystem state.",
    "execution_priority": 8
  },
  {
    "tc_id": "TC125",
    "tc_name": "should not create temp directory if it exists",
    "file": "reports.test.js",
    "line": 381,
    "feature": "F5",
    "classifications": ["Core", "Config"],
    "priority_score": 1.1,
    "reasoning": "Core: CSV export for billing. Config: Temp directory existence varies by deployment environment.",
    "execution_priority": 9
  }
]
```

### Full Classification Matrix (Markdown)

| Exec # | TC ID | TC Name | File | Feature | Classifications | Priority Score | Reasoning |
|--------|-------|---------|------|---------|----------------|---------------|-----------|
| 1 | TC011a | clients table FK to users | init.test.js:161 | F8, F11 | Core, Config | 1.10 | Core: Referential integrity. Config: Schema differs in-memory vs file. |
| 2 | TC011b | work_entries table FKs | init.test.js:174 | F8, F11 | Core, Config | 1.10 | Core: FK constraints. Config: PRAGMA foreign_keys differs by env. |
| 3 | TC001 | create database instance | init.test.js:42 | F8 | Core, Config | 1.10 | Core: DB singleton. Config: DATABASE_PATH switches in-memory/file. |
| 4 | TC002 | same instance on multiple calls | init.test.js:49 | F8 | Core, Config | 1.10 | Core: Singleton pattern. Config: Behavior varies by path. |
| 5 | TC003 | handle connection error | init.test.js:56 | F8 | Core, Config | 1.10 | Core: Init resilience. Config: File-based DB more error-prone. |
| 6 | TC004 | create all required tables | init.test.js:78 | F8 | Core, Config | 1.10 | Core: Schema creation. Config: DDL may differ by storage mode. |
| 7 | TC008 | close database connection | init.test.js:119 | F8 | Core, Config | 1.10 | Core: Graceful shutdown. Config: Close differs file vs in-memory. |
| 8 | TC124 | create temp dir if not exists | reports.test.js:355 | F5 | Core, Config | 1.10 | Core: CSV billing export. Config: Filesystem varies by deploy. |
| 9 | TC125 | skip temp dir if exists | reports.test.js:381 | F5 | Core, Config | 1.10 | Core: CSV billing export. Config: Temp dir state varies. |
| 10 | TC012 | 401 if header missing | auth.test.js:32 | F1 | Core | 1.00 | Core: Authentication gate — missing header rejection. |
| 11 | TC013 | 400 if email invalid | auth.test.js:42 | F1 | Core | 1.00 | Core: Prevents malformed email from bypassing auth. |
| 12 | TC014 | accept valid email | auth.test.js:54 | F1 | Core | 1.00 | Core: Validates legitimate users can authenticate. |
| 13 | TC015 | authenticate existing user | auth.test.js:68 | F1 | Core | 1.00 | Core: Happy path for returning users. |
| 14 | TC016 | handle DB error checking user | auth.test.js:85 | F1 | Core | 1.00 | Core: Auth resilience under DB failure. |
| 15 | TC017 | create new user if not exists | auth.test.js:106 | F1 | Core | 1.00 | Core: Auto-provisioning onboarding flow. |
| 16 | TC018 | handle error creating new user | auth.test.js:131 | F1 | Core | 1.00 | Core: Auth fails gracefully on creation error. |
| 17 | TC031 | login existing user | auth.test.js:35 | F1 | Core | 1.00 | Core: Login API for existing users. |
| 18 | TC032 | create new user on first login | auth.test.js:54 | F1 | Core | 1.00 | Core: Auto-registration on first login. |
| 19 | TC033 | 400 for invalid email (login) | auth.test.js:77 | F1 | Core | 1.00 | Core: Input validation on auth endpoint. |
| 20 | TC034 | 400 for missing email (login) | auth.test.js:86 | F1 | Core | 1.00 | Core: Prevents empty auth requests. |
| 21 | TC035 | handle DB error checking user (login) | auth.test.js:95 | F1 | Core | 1.00 | Core: Login resilience under DB failure. |
| 22 | TC036 | handle DB error creating user (login) | auth.test.js:108 | F1 | Core | 1.00 | Core: Login resilience under DB write failure. |
| 23 | TC037 | handle unexpected errors (login) | auth.test.js:125 | F1 | Core | 1.00 | Core: Catch-all error handling in auth. |
| 24 | TC038 | return current user info | auth.test.js:140 | F1 | Core | 1.00 | Core: Session verification via GET /me. |
| 25 | TC039 | 401 if no header (GET /me) | auth.test.js:159 | F1 | Core | 1.00 | Core: Protected endpoint rejects unauth requests. |
| 26 | TC040 | 404 if user not found (GET /me) | auth.test.js:166 | F1 | Core | 1.00 | Core: Handles deleted user gracefully. |
| 27 | TC041 | handle DB error (GET /me) | auth.test.js:185 | F1 | Core | 1.00 | Core: GET /me resilience. |
| 28 | TC042 | return all clients for user | clients.test.js:42 | F2, F11 | Core | 1.00 | Core: Data isolation — only user's clients returned. |
| 29 | TC059 | delete existing client | clients.test.js:280 | F12 | Core | 1.00 | Core: Client deletion with CASCADE to work entries. |
| 30 | TC070 | return all work entries for user | workEntries.test.js:42 | F3, F11 | Core | 1.00 | Core: Primary workflow — listing time entries with isolation. |
| 31 | TC077 | create work entry with valid data | workEntries.test.js:126 | F3 | Core | 1.00 | Core: Primary workflow — creating time entries. |
| 32 | TC083 | update work entry hours | workEntries.test.js:227 | F3 | Core | 1.00 | Core: Primary workflow — editing time entries. |
| 33 | TC089 | delete existing work entry | workEntries.test.js:313 | F3 | Core | 1.00 | Core: Primary workflow — removing time entries. |
| 34 | TC105 | return client report with entries | reports.test.js:62 | F4, F11 | Core | 1.00 | Core: Report generation with hours aggregation. |
| 35 | TC111 | filter work entries by user email | reports.test.js:148 | F11 | Core | 1.00 | Core: Data isolation enforcement on reports. |
| 36 | TC112 | 400 for invalid ID (CSV) | reports.test.js:169 | F5 | Core | 1.00 | Core: Input validation on billing export. |
| 37 | TC113 | 404 if client not found (CSV) | reports.test.js:176 | F5 | Core | 1.00 | Core: Authorization check on CSV export. |
| 38 | TC116 | 400 for invalid ID (PDF) | reports.test.js:215 | F6 | Core | 1.00 | Core: Input validation on PDF export. |
| 39 | TC117 | 404 if client not found (PDF) | reports.test.js:222 | F6 | Core | 1.00 | Core: Authorization check on PDF export. |
| 40 | TC119 | data for authenticated user only | reports.test.js:246 | F11 | Core | 1.00 | Core: Explicit data isolation verification. |
| 41 | TC120 | correctly sum decimal hours | reports.test.js:268 | F4 | Core | 1.00 | Core: Financial calculation accuracy. |
| 42 | TC122 | handle CSV write error | reports.test.js:305 | F5 | Core | 1.00 | Core: Error handling for billing export. |
| 43 | TC123 | CSV export correct DB queries | reports.test.js:330 | F5, F11 | Core | 1.00 | Core: Data isolation in CSV export. |
| 44 | TC127 | PDF export correct DB queries | reports.test.js:423 | F6, F11 | Core | 1.00 | Core: Data isolation in PDF export. |
| 45 | TC005 | create indexes for performance | init.test.js:94 | F8 | Core | 1.00 | Core: Index creation for query performance. |
| 46 | TC006 | log success message | init.test.js:107 | F8 | Core | 1.00 | Core: Confirms database init completes. |
| 47 | TC007 | resolve promise on success | init.test.js:113 | F8 | Core | 1.00 | Core: Async init resolves for server startup. |
| 48 | TC121 | handle integer hours | reports.test.js:286 | F4 | Core | 1.00 | Core: Financial calculation for whole hours. |
| 49 | TC043 | return empty array when no clients | clients.test.js:63 | F2 | Unclassified | 0.20 | No Core/Config classification. |
| 50 | TC044 | handle DB error (GET / clients) | clients.test.js:74 | F2 | Unclassified | 0.20 | Error handling, non-critical path. |
| 51 | TC045 | return specific client | clients.test.js:87 | F2 | Unclassified | 0.20 | Standard CRUD read. |
| 52 | TC046 | 404 if client not found | clients.test.js:100 | F2 | Unclassified | 0.20 | Standard error case. |
| 53 | TC047 | 400 for invalid client ID | clients.test.js:111 | F2 | Unclassified | 0.20 | Input validation. |
| 54 | TC048 | handle DB error (GET /:id) | clients.test.js:118 | F2 | Unclassified | 0.20 | Error handling. |
| 55 | TC049 | create new client | clients.test.js:131 | F2 | Unclassified | 0.20 | Standard CRUD create. |
| 56 | TC050 | create client without desc | clients.test.js:153 | F2 | Unclassified | 0.20 | Optional field handling. |
| 57 | TC051 | 400 for missing name | clients.test.js:173 | F2 | Unclassified | 0.20 | Validation. |
| 58 | TC052 | 400 for empty name | clients.test.js:181 | F2 | Unclassified | 0.20 | Validation. |
| 59 | TC053 | handle DB insert error | clients.test.js:189 | F2 | Unclassified | 0.20 | Error handling. |
| 60 | TC054 | update client name | clients.test.js:204 | F2 | Unclassified | 0.20 | Standard CRUD update. |
| 61 | TC055 | update client description | clients.test.js:228 | F2 | Unclassified | 0.20 | Standard CRUD update. |
| 62 | TC056 | 404 if client not found (PUT) | clients.test.js:248 | F2 | Unclassified | 0.20 | Error case. |
| 63 | TC057 | 400 for invalid ID (PUT) | clients.test.js:261 | F2 | Unclassified | 0.20 | Validation. |
| 64 | TC058 | 400 for empty update | clients.test.js:270 | F2 | Unclassified | 0.20 | Validation. |
| 65 | TC060 | 404 if client not found (DELETE) | clients.test.js:295 | F2 | Unclassified | 0.20 | Error case. |
| 66 | TC061 | 400 for invalid ID (DELETE) | clients.test.js:306 | F2 | Unclassified | 0.20 | Validation. |
| 67 | TC062 | handle DB delete error | clients.test.js:313 | F2 | Unclassified | 0.20 | Error handling. |
| 68 | TC063 | handle DB error checking existence (DELETE) | clients.test.js:328 | F2 | Unclassified | 0.20 | Error handling. |
| 69 | TC064 | handle error retrieving after creation | clients.test.js:341 | F2 | Unclassified | 0.20 | Error handling. |
| 70 | TC065 | handle DB error checking existence (PUT) | clients.test.js:361 | F2 | Unclassified | 0.20 | Error handling. |
| 71 | TC066 | handle DB error during update | clients.test.js:374 | F2 | Unclassified | 0.20 | Error handling. |
| 72 | TC067 | handle error retrieving after update | clients.test.js:391 | F2 | Unclassified | 0.20 | Error handling. |
| 73 | TC068 | update both name and description | clients.test.js:412 | F2 | Unclassified | 0.20 | Multi-field update. |
| 74 | TC069 | update description to null | clients.test.js:435 | F2 | Unclassified | 0.20 | Nullable field handling. |
| 75 | TC071 | filter by client ID | workEntries.test.js:58 | F3 | Unclassified | 0.20 | Query filter. |
| 76 | TC072 | 400 for invalid client ID filter | workEntries.test.js:73 | F3 | Unclassified | 0.20 | Validation. |
| 77 | TC073 | handle DB error (GET / entries) | workEntries.test.js:80 | F3 | Unclassified | 0.20 | Error handling. |
| 78 | TC074 | return specific work entry | workEntries.test.js:93 | F3 | Unclassified | 0.20 | Standard CRUD read. |
| 79 | TC075 | 404 if not found | workEntries.test.js:106 | F3 | Unclassified | 0.20 | Error case. |
| 80 | TC076 | 400 for invalid ID | workEntries.test.js:117 | F3 | Unclassified | 0.20 | Validation. |
| 81 | TC078 | 400 if client not found (POST) | workEntries.test.js:155 | F3 | Unclassified | 0.20 | Cross-entity validation. |
| 82 | TC079 | 400 for missing fields | workEntries.test.js:172 | F3 | Unclassified | 0.20 | Validation. |
| 83 | TC080 | 400 for invalid hours | workEntries.test.js:180 | F3 | Unclassified | 0.20 | Validation. |
| 84 | TC081 | 400 for hours > 24 | workEntries.test.js:192 | F3 | Unclassified | 0.20 | Validation. |
| 85 | TC082 | handle DB error on insert | workEntries.test.js:204 | F3 | Unclassified | 0.20 | Error handling. |
| 86 | TC084 | update work entry client | workEntries.test.js:248 | F3 | Unclassified | 0.20 | Cross-entity update. |
| 87 | TC085 | 404 if not found (PUT) | workEntries.test.js:264 | F3 | Unclassified | 0.20 | Error case. |
| 88 | TC086 | 400 for invalid ID (PUT) | workEntries.test.js:277 | F3 | Unclassified | 0.20 | Validation. |
| 89 | TC087 | 400 for empty update | workEntries.test.js:286 | F3 | Unclassified | 0.20 | Validation. |
| 90 | TC088 | 400 if new client not found | workEntries.test.js:294 | F3 | Unclassified | 0.20 | Cross-entity validation. |
| 91 | TC090 | 404 if not found (DELETE) | workEntries.test.js:328 | F3 | Unclassified | 0.20 | Error case. |
| 92 | TC091 | 400 for invalid ID (DELETE) | workEntries.test.js:339 | F3 | Unclassified | 0.20 | Validation. |
| 93 | TC092 | handle DB delete error | workEntries.test.js:346 | F3 | Unclassified | 0.20 | Error handling. |
| 94 | TC093 | handle DB error checking existence | workEntries.test.js:361 | F3 | Unclassified | 0.20 | Error handling. |
| 95 | TC094 | handle DB error fetching single | workEntries.test.js:374 | F3 | Unclassified | 0.20 | Error handling. |
| 96 | TC095 | handle DB error verifying client | workEntries.test.js:387 | F3 | Unclassified | 0.20 | Error handling. |
| 97 | TC096 | handle error retrieving after creation | workEntries.test.js:404 | F3 | Unclassified | 0.20 | Error handling. |
| 98 | TC097 | handle DB error checking existence (PUT) | workEntries.test.js:434 | F3 | Unclassified | 0.20 | Error handling. |
| 99 | TC098 | handle DB error verifying new client | workEntries.test.js:447 | F3 | Unclassified | 0.20 | Error handling. |
| 100 | TC099 | handle DB error during update | workEntries.test.js:466 | F3 | Unclassified | 0.20 | Error handling. |
| 101 | TC100 | handle error retrieving after update | workEntries.test.js:483 | F3 | Unclassified | 0.20 | Error handling. |
| 102 | TC101 | update work entry date | workEntries.test.js:506 | F3 | Unclassified | 0.20 | Field update. |
| 103 | TC102 | update work entry description | workEntries.test.js:527 | F3 | Unclassified | 0.20 | Field update. |
| 104 | TC103 | update description to null | workEntries.test.js:547 | F3 | Unclassified | 0.20 | Nullable field handling. |
| 105 | TC104 | update multiple fields at once | workEntries.test.js:567 | F3 | Unclassified | 0.20 | Multi-field update. |
| 106 | TC106 | report with zero hours | reports.test.js:86 | F4 | Unclassified | 0.20 | Edge case. |
| 107 | TC107 | 404 if client not found (report) | reports.test.js:104 | F4 | Unclassified | 0.20 | Error case. |
| 108 | TC108 | 400 for invalid ID (report) | reports.test.js:115 | F4 | Unclassified | 0.20 | Validation. |
| 109 | TC109 | handle DB error fetching client | reports.test.js:122 | F4 | Unclassified | 0.20 | Error handling. |
| 110 | TC110 | handle DB error fetching entries | reports.test.js:133 | F4 | Unclassified | 0.20 | Error handling. |
| 111 | TC114 | handle DB error fetching client (CSV) | reports.test.js:187 | F5 | Unclassified | 0.20 | Error handling. |
| 112 | TC115 | handle DB error fetching entries (CSV) | reports.test.js:198 | F5 | Unclassified | 0.20 | Error handling. |
| 113 | TC118 | handle DB error (PDF) | reports.test.js:233 | F6 | Unclassified | 0.20 | Error handling. |
| 114 | TC126 | handle DB error fetching entries (PDF) | reports.test.js:408 | F6 | Unclassified | 0.20 | Error handling. |
| 115 | TC009 | handle close error gracefully | init.test.js:127 | F8 | Unclassified | 0.20 | Error handling. |
| 116 | TC010 | handle multiple close calls | init.test.js:136 | F8 | Unclassified | 0.20 | Edge case. |
| 117 | TC019 | reject email without @ | auth.test.js:156 | F7 | Unclassified | 0.20 | Validation edge case. |
| 118 | TC020 | reject email without domain | auth.test.js:162 | F7 | Unclassified | 0.20 | Validation edge case. |
| 119 | TC021 | reject email without TLD | auth.test.js:168 | F7 | Unclassified | 0.20 | Validation edge case. |
| 120 | TC022 | accept email with subdomain | auth.test.js:174 | F1 | Unclassified | 0.20 | Validation edge case. |
| 121 | TC023 | handle Joi validation error | errorHandler.test.js:23 | F9 | Unclassified | 0.20 | Error middleware. |
| 122 | TC024 | handle single Joi error | errorHandler.test.js:41 | F9 | Unclassified | 0.20 | Error middleware. |
| 123 | TC025 | handle SQLITE_CONSTRAINT | errorHandler.test.js:58 | F9 | Unclassified | 0.20 | Error middleware. |
| 124 | TC026 | handle SQLITE_ERROR | errorHandler.test.js:73 | F9 | Unclassified | 0.20 | Error middleware. |
| 125 | TC027 | handle custom status error | errorHandler.test.js:90 | F9 | Unclassified | 0.20 | Error middleware. |
| 126 | TC028 | default to 500 | errorHandler.test.js:104 | F9 | Unclassified | 0.20 | Error middleware. |
| 127 | TC029 | default message if none | errorHandler.test.js:117 | F9 | Unclassified | 0.20 | Error middleware. |
| 128 | TC030 | log error to console | errorHandler.test.js:130 | F9 | Unclassified | 0.20 | Error middleware. |
| 129–159 | TC128–TC159 | Validation schema tests | schemas.test.js | F7 | Unclassified | 0.20 | Input validation rules — covered at 100%. |

---

## 8. Coverage Gap Report & New TC Recommendations

### 8.1 Critical Gaps (untested + high business impact)

| Priority | Feature | Current Coverage | Gap Description | Risk Level |
|----------|---------|-----------------|-----------------|------------|
| 1 | PDF Export (F6) | 64% (lines 187–240 untested) | Full PDF generation — PDFKit document creation, content layout, table rendering, pagination (`y > 700` check), `doc.end()` finalization — completely untested | **CRITICAL** |
| 2 | CSV Export (F5) | 64% (lines 127–134 untested) | CSV file download via `res.download()`, temp file cleanup via `fs.unlink()`, success path — all untested | **CRITICAL** |
| 3 | Bulk Client Delete (F12) | 0% (lines 191–202) | `DELETE /api/clients` route deletes ALL clients for user with CASCADE to work entries — zero test coverage | **HIGH** |
| 4 | Frontend (F10, F13, F14) | 0% | No frontend tests at all — LoginPage auth flow, DashboardPage aggregation, ReportsPage export triggers | **MEDIUM** |
| 5 | Cross-User Data Isolation (F11) | Partial | No dedicated negative tests attempting to access another user's data on every endpoint | **HIGH** |
| 6 | Dynamic SQL — department/email fields (F2) | 85.71% branch | `clients.js` PUT route branches for `department` and `email` fields (lines 145–151) untested | **MEDIUM** |

### 8.2 Recommended New Test Cases

| # | Feature | Suggested TC Description | RCRCR Classification | Priority | Effort |
|---|---------|-------------------------|---------------------|----------|--------|
| NEW-01 | F6 — PDF Export | Test PDF generation success path: valid client with entries → verify response headers (Content-Type: application/pdf), doc.pipe called, doc.end called, entry iteration | Core | **P1 — Critical** | Medium |
| NEW-02 | F6 — PDF Export | Test PDF pagination: provide > 20 entries to trigger `y > 700` → `addPage()` | Core | **P1 — Critical** | Medium |
| NEW-03 | F6 — PDF Export | Test PDF with empty work entries: valid client, no entries → verify PDF generated with zero totals | Core | **P1 — Critical** | Low |
| NEW-04 | F5 — CSV Export | Test CSV download success path: valid client with entries → verify `res.download()` called, `fs.unlink` cleanup executed | Core, Config | **P1 — Critical** | Medium |
| NEW-05 | F5 — CSV Export | Test CSV with empty entries: valid client, no entries → verify empty CSV generated | Core | **P1 — Critical** | Low |
| NEW-06 | F5 — CSV Export | Test CSV temp file cleanup on download error: simulate `res.download` error → verify `fs.unlink` still called | Core, Config | **P1 — Critical** | Medium |
| NEW-07 | F12 — Bulk Delete | Test `DELETE /api/clients` success: create clients → bulk delete → verify all removed and count returned | Core | **P2 — High** | Low |
| NEW-08 | F12 — Bulk Delete | Test `DELETE /api/clients` with CASCADE: verify work entries also deleted when clients are bulk-removed | Core | **P2 — High** | Medium |
| NEW-09 | F12 — Bulk Delete | Test `DELETE /api/clients` data isolation: verify only authenticated user's clients are deleted, not other users' | Core | **P2 — High** | Medium |
| NEW-10 | F12 — Bulk Delete | Test `DELETE /api/clients` database error: simulate DB failure → verify 500 response | Core | **P2 — High** | Low |
| NEW-11 | F11 — Data Isolation | Test cross-user access on `GET /api/clients/:id`: user A's client ID → request as user B → expect 404 | Core | **P2 — High** | Low |
| NEW-12 | F11 — Data Isolation | Test cross-user access on `PUT /api/work-entries/:id`: user A's entry → update as user B → expect 404 | Core | **P2 — High** | Low |
| NEW-13 | F11 — Data Isolation | Test cross-user access on `GET /api/reports/client/:id`: user A's client → report as user B → expect 404 | Core | **P2 — High** | Low |
| NEW-14 | F11 — Data Isolation | Test cross-user access on CSV/PDF export: user A's client → export as user B → expect 404 | Core | **P2 — High** | Low |
| NEW-15 | F2 — Client CRUD | Test PUT with department field update: verify dynamic SQL includes department column | Unclassified | **P3 — Medium** | Low |
| NEW-16 | F2 — Client CRUD | Test PUT with email field update: verify dynamic SQL includes email column | Unclassified | **P3 — Medium** | Low |
| NEW-17 | F8 — Database | Test `closeDatabase()` when `isClosing=true`: verify interval-based polling resolves correctly | Config | **P3 — Medium** | Medium |
| NEW-18 | F8 — Database | Test `closeDatabase()` when `db=null`: verify immediate resolve without error | Config | **P3 — Medium** | Low |
| NEW-19 | F14 — API Client | Test Axios interceptor adds x-user-email header from localStorage | Core | **P3 — Medium** | Medium |
| NEW-20 | F14 — API Client | Test 401 response interceptor clears localStorage and redirects to /login | Core | **P3 — Medium** | Medium |
| NEW-21 | F1 — LoginPage | Test LoginPage renders email input and submit button | Core | **P4 — Low** | Low |
| NEW-22 | F10 — DashboardPage | Test DashboardPage displays correct metric totals | Unclassified | **P4 — Low** | Medium |
| NEW-23 | F13 — ReportsPage | Test ReportsPage CSV/PDF export button triggers correct API call | Core | **P4 — Low** | Medium |
| NEW-24 | F15 — Docker Config | Test production override uses DATABASE_PATH env var for file-based SQLite | Config | **P3 — Medium** | High |
| NEW-25 | F15 — Docker Config | Test production override serves static files and React SPA routing | Config | **P3 — Medium** | High |

---

## 9. Execution Summary Statistics

```
Total Existing TCs: 161
  Core:           48 (29.8%)
  Core + Config:   9 ( 5.6%)
  Config only:     0 ( 0.0%)
  Unclassified:  104 (64.6%)

Note: Recent, Repair, Chronic, and Risk classifications require
      release scope and historical data (Phase 2 & Phase 3).

Backend Statement Coverage:  87.17%  (Target: 80%+ MET)
Frontend Statement Coverage:  0.00%  (Target: 80%+ NOT MET)

Critical Coverage Gaps: 2 (CSV export success path, PDF generation logic)
High Coverage Gaps:     2 (Bulk delete, Cross-user isolation negative tests)

New TCs Recommended: 25
  P1 — Critical: 6  (PDF/CSV export success paths)
  P2 — High:     8  (Bulk delete, data isolation negative tests)
  P3 — Medium:   7  (DB edge cases, dynamic SQL branches, Docker config)
  P4 — Low:      4  (Frontend component tests)
```

### Execution Tiers

| Tier | Classifications | TC Count | Use When |
|------|----------------|----------|----------|
| **Tier 1 — Smoke** | Core (top 20% by score) | ~10 TCs | < 1 hour available |
| **Tier 2 — Critical** | Core + Config | 57 TCs | < 4 hours available |
| **Tier 3 — Release** | All classified | 57 TCs | Standard release cycle |
| **Tier 4 — Full** | All (including unclassified) | 161 TCs | Full regression |

---

*Generated by Devin AI — Risk-Based Testing Phase 1 Analysis*
*RCRCR Framework v1.0 | Scoring Configuration: CHRONIC_FAILURE_WEIGHT=0.35, CHRONIC_DEFECT_WEIGHT=0.65, CHRONIC_THRESHOLD=0.50*
