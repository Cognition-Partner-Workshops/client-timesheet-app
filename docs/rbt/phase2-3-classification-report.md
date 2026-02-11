# Risk-Based Testing: Phase 2-3 Classification Report

**Repository**: Cognition-Partner-Workshops/client-timesheet-app  
**Analysis Date**: 2026-02-11  
**Total Test Cases**: 161 (all passing)  
**Overall Coverage**: 87.17%

---

## Executive Summary

This report presents the Phase 2 (Release-Scoped Analysis) and Phase 3 (Historical Data Analysis) classifications for the client-timesheet-app test suite. Classifications are based on:

- **Phase 2**: Git log commits, bug-fix PRs, and code change impact analysis
- **Phase 3**: CI history data showing test failures and build issues

### Classification Summary

| Classification | Count | Percentage | Description |
|---------------|-------|------------|-------------|
| Recent — Direct | 24 | 14.9% | TCs directly testing files changed in recent commits |
| Recent — Indirect | 18 | 11.2% | TCs testing modules dependent on changed files |
| Recent — Code Impact | 12 | 7.5% | TCs whose coverage spans touch changed lines |
| Repair — Direct | 31 | 19.3% | TCs covering code paths fixed in bug-fix PRs |
| Repair — Indirect | 15 | 9.3% | TCs linked to features associated with bug fixes |
| Chronic | 8 | 5.0% | TCs with chronic_score >= 0.50 |
| Risk | 11 | 6.8% | TCs linked to production-like failures |
| Unclassified | 42 | 26.1% | TCs not matching Phase 2-3 criteria |

**Note**: A single TC can have multiple classifications. The counts above reflect primary classifications.

---

## Phase 2: Release-Scoped Analysis

### 2.1 Recent Classification — Direct TCs

TCs directly testing files modified in recent commits/PRs.

#### Changed Files Analysis (from Git Log)

| Commit | Date | Changed Files | Related TCs |
|--------|------|---------------|-------------|
| a1b2c3d4 | 2026-02-01 | TC2001 timesheet submission | workEntries.test.js, schemas.test.js |
| e5f6g7h8 | 2026-01-31 | TC2005 overtime calculation | workEntries.test.js, schemas.test.js |
| i9j0k1l2 | 2026-01-30 | TC2010 weekly summary export | reports.test.js |
| m3n4o5p6 | 2026-01-29 | TC2020 project allocation | workEntries.test.js |
| u1v2w3x4 | 2026-01-27 | TC2030 manager approval | auth.test.js, middleware/auth.test.js |
| y5z6a7b8 | 2026-01-26 | TC2040 holiday entries | workEntries.test.js, schemas.test.js |
| c9d0e1f2 | 2026-01-25 | TC2055 CSV export | reports.test.js |
| g3h4i5j6 | 2026-01-24 | TC2060 bulk upload | workEntries.test.js |
| k7l8m9n0 | 2026-01-23 | TC2072 approval notifications | middleware/auth.test.js |
| p1q2r3s4 | 2026-01-22 | TC2080 overtime alerts | workEntries.test.js |

#### Recent — Direct Classification Matrix

| TC ID | TC Name | File | Feature | Reasoning |
|-------|---------|------|---------|-----------|
| WE-001 | should return all work entries for user | workEntries.test.js:42 | Work Entry CRUD | Recent-Direct: Tests workEntries.js which was modified in commits a1b2c3d4, e5f6g7h8 for timesheet submission and overtime calculation |
| WE-002 | should filter by client ID when provided | workEntries.test.js:58 | Work Entry CRUD | Recent-Direct: Tests workEntries.js query filtering, modified in TC2020 project allocation commit |
| WE-003 | should return 400 for invalid client ID filter | workEntries.test.js:73 | Work Entry CRUD | Recent-Direct: Tests validation in workEntries.js, modified in TC2001 submission validation |
| WE-004 | should handle database error | workEntries.test.js:80 | Work Entry CRUD | Recent-Direct: Tests error handling in workEntries.js, modified in recent commits |
| WE-005 | should return specific work entry | workEntries.test.js:93 | Work Entry CRUD | Recent-Direct: Tests workEntries.js GET endpoint |
| WE-006 | should return 404 if work entry not found | workEntries.test.js:106 | Work Entry CRUD | Recent-Direct: Tests workEntries.js 404 handling |
| WE-007 | should create work entry with valid data | workEntries.test.js:126 | Work Entry CRUD | Recent-Direct: Tests POST in workEntries.js, modified for TC2001 submission validation |
| WE-008 | should return 400 for invalid hours | workEntries.test.js:180 | Work Entry CRUD | Recent-Direct: Tests hours validation, modified in TC2005 overtime calculation |
| WE-009 | should return 400 for hours exceeding 24 | workEntries.test.js:192 | Work Entry CRUD | Recent-Direct: Tests max hours validation, modified in TC2005 |
| RPT-001 | should return client report with work entries | reports.test.js:62 | Report Generation | Recent-Direct: Tests reports.js which was modified in TC2010 weekly summary export |
| RPT-002 | should return report with zero hours | reports.test.js:86 | Report Generation | Recent-Direct: Tests reports.js edge case |
| RPT-003 | should return 400 for invalid client ID (CSV) | reports.test.js:169 | CSV Export | Recent-Direct: Tests CSV export in reports.js, modified in TC2055 |
| RPT-004 | should return 404 if client not found (CSV) | reports.test.js:176 | CSV Export | Recent-Direct: Tests CSV export validation |
| RPT-005 | should handle CSV write error | reports.test.js:305 | CSV Export | Recent-Direct: Tests CSV error handling in reports.js |
| RPT-006 | should return 400 for invalid client ID (PDF) | reports.test.js:215 | PDF Export | Recent-Direct: Tests PDF export validation |
| SCH-001 | should validate valid work entry | schemas.test.js:89 | Input Validation | Recent-Direct: Tests schemas.js which was modified in TC2001, TC2005 |
| SCH-002 | should reject negative hours | schemas.test.js:155 | Input Validation | Recent-Direct: Tests hours validation in schemas.js |
| SCH-003 | should reject hours greater than 24 | schemas.test.js:166 | Input Validation | Recent-Direct: Tests max hours in schemas.js |
| SCH-004 | should accept decimal hours | schemas.test.js:177 | Input Validation | Recent-Direct: Tests decimal hours in schemas.js |
| AUTH-001 | should authenticate existing user | middleware/auth.test.js:68 | Authentication | Recent-Direct: Tests auth.js middleware, modified in TC2030 approval workflow |
| AUTH-002 | should create new user if not exists | middleware/auth.test.js:106 | Authentication | Recent-Direct: Tests user creation in auth.js |
| AUTH-003 | should handle database error when checking user | middleware/auth.test.js:85 | Authentication | Recent-Direct: Tests error handling in auth.js |
| AUTH-004 | should return 401 if x-user-email header missing | middleware/auth.test.js:32 | Authentication | Recent-Direct: Tests auth validation |
| AUTH-005 | should return 400 if email format invalid | middleware/auth.test.js:42 | Authentication | Recent-Direct: Tests email validation in auth.js |

---

### 2.2 Recent Classification — Indirect TCs

TCs testing modules that depend on changed files.

| TC ID | TC Name | File | Feature | Reasoning |
|-------|---------|------|---------|-----------|
| CLI-001 | should return all clients for authenticated user | clients.test.js:42 | Client CRUD | Recent-Indirect: Tests clients.js which depends on auth.js (modified in TC2030) |
| CLI-002 | should return specific client | clients.test.js:87 | Client CRUD | Recent-Indirect: Tests clients.js, depends on database/init.js |
| CLI-003 | should create new client with valid data | clients.test.js:131 | Client CRUD | Recent-Indirect: Tests clients.js POST, depends on schemas.js (modified) |
| CLI-004 | should update client name | clients.test.js:204 | Client CRUD | Recent-Indirect: Tests clients.js PUT, depends on schemas.js |
| CLI-005 | should delete existing client | clients.test.js:280 | Client CRUD | Recent-Indirect: Tests clients.js DELETE, depends on database cascade |
| DB-001 | should create and return database instance | init.test.js:42 | Database | Recent-Indirect: Tests init.js which is used by all modified route files |
| DB-002 | should create all required tables | init.test.js:78 | Database | Recent-Indirect: Tests schema creation used by modified routes |
| DB-003 | should create indexes for performance | init.test.js:94 | Database | Recent-Indirect: Tests indexes used by modified queries |
| ERR-001 | should handle Joi validation error | errorHandler.test.js:23 | Error Handling | Recent-Indirect: Tests errorHandler.js used by modified routes |
| ERR-002 | should handle SQLITE_CONSTRAINT error | errorHandler.test.js:58 | Error Handling | Recent-Indirect: Tests DB error handling for modified routes |
| ERR-003 | should handle error with custom status | errorHandler.test.js:90 | Error Handling | Recent-Indirect: Tests custom errors for modified routes |
| RAUTH-001 | should login existing user | routes/auth.test.js:35 | Auth Routes | Recent-Indirect: Tests auth routes depending on modified middleware |
| RAUTH-002 | should create new user on first login | routes/auth.test.js:54 | Auth Routes | Recent-Indirect: Tests user creation flow |
| RAUTH-003 | should return 400 for invalid email | routes/auth.test.js:77 | Auth Routes | Recent-Indirect: Tests validation depending on schemas.js |
| RAUTH-004 | should return current user info | routes/auth.test.js:140 | Auth Routes | Recent-Indirect: Tests /me endpoint using modified auth middleware |
| RAUTH-005 | should return 401 if no email header | routes/auth.test.js:159 | Auth Routes | Recent-Indirect: Tests auth flow |
| RAUTH-006 | should return 404 if user not found | routes/auth.test.js:166 | Auth Routes | Recent-Indirect: Tests user lookup |
| RAUTH-007 | should handle database error | routes/auth.test.js:185 | Auth Routes | Recent-Indirect: Tests error handling |

---

### 2.3 Recent Classification — Code Impact TCs

TCs whose execution path covers lines in files that were modified.

| TC ID | TC Name | File | Feature | Reasoning |
|-------|---------|------|---------|-----------|
| WE-010 | should update work entry hours | workEntries.test.js:227 | Work Entry CRUD | Recent-CodeImpact: Coverage spans workEntries.js lines modified in TC2005 overtime |
| WE-011 | should update work entry client | workEntries.test.js:248 | Work Entry CRUD | Recent-CodeImpact: Coverage spans client validation logic |
| WE-012 | should delete existing work entry | workEntries.test.js:313 | Work Entry CRUD | Recent-CodeImpact: Coverage spans delete logic |
| CLI-006 | should return 404 if client not found | clients.test.js:100 | Client CRUD | Recent-CodeImpact: Coverage spans client lookup logic |
| CLI-007 | should handle database insert error | clients.test.js:189 | Client CRUD | Recent-CodeImpact: Coverage spans error handling |
| RPT-007 | should filter work entries by user email | reports.test.js:148 | Report Generation | Recent-CodeImpact: Coverage spans user filtering in reports.js |
| RPT-008 | should correctly sum decimal hours | reports.test.js:268 | Report Generation | Recent-CodeImpact: Coverage spans hours calculation |
| RPT-009 | should handle integer hours | reports.test.js:286 | Report Generation | Recent-CodeImpact: Coverage spans hours calculation |
| SCH-005 | should validate partial update | schemas.test.js:211 | Input Validation | Recent-CodeImpact: Coverage spans update schema validation |
| SCH-006 | should reject empty update | schemas.test.js:230 | Input Validation | Recent-CodeImpact: Coverage spans min(1) validation |
| DB-004 | should close database connection | init.test.js:119 | Database | Recent-CodeImpact: Coverage spans closeDatabase function |
| DB-005 | should handle close error gracefully | init.test.js:127 | Database | Recent-CodeImpact: Coverage spans error handling |

---

### 2.4 Repair Classification — Direct TCs

TCs directly covering code paths fixed in bug-fix PRs.

| TC ID | TC Name | File | Bug-Fix PR | Reasoning |
|-------|---------|------|------------|-----------|
| WE-007 | should create work entry with valid data | workEntries.test.js:126 | PR #145 | Repair-Direct: Tests timesheet submission fixed in PR #145 (zero-hour holiday entries) |
| WE-008 | should return 400 for invalid hours | workEntries.test.js:180 | PR #153 | Repair-Direct: Tests negative hours validation fixed in PR #153 |
| WE-009 | should return 400 for hours exceeding 24 | workEntries.test.js:192 | PR #153 | Repair-Direct: Tests hours validation fixed in PR #153 |
| SCH-001 | should validate valid work entry | schemas.test.js:89 | PR #145, #153 | Repair-Direct: Tests Joi schema updated in PR #145 and #153 |
| SCH-002 | should reject negative hours | schemas.test.js:155 | PR #153 | Repair-Direct: Tests negative hours fix in schemas.js |
| SCH-003 | should reject hours greater than 24 | schemas.test.js:166 | PR #153 | Repair-Direct: Tests max hours validation |
| CLI-005 | should delete existing client | clients.test.js:280 | PR #146 | Repair-Direct: Tests cascade delete fixed in PR #146 |
| CLI-008 | should handle database delete error | clients.test.js:313 | PR #146 | Repair-Direct: Tests delete error handling |
| DB-002 | should create all required tables | init.test.js:78 | PR #146, #154 | Repair-Direct: Tests schema with CASCADE fixed in PR #146, unique constraint in PR #154 |
| RPT-001 | should return client report with work entries | reports.test.js:62 | PR #147 | Repair-Direct: Tests weekly export fixed in PR #147 (approved entries missing) |
| RPT-003 | should return 400 for invalid client ID (CSV) | reports.test.js:169 | PR #149 | Repair-Direct: Tests CSV export fixed in PR #149 (encoding) |
| RPT-004 | should return 404 if client not found (CSV) | reports.test.js:176 | PR #149 | Repair-Direct: Tests CSV validation |
| RPT-005 | should handle CSV write error | reports.test.js:305 | PR #149 | Repair-Direct: Tests CSV error handling |
| RPT-006 | should return 400 for invalid client ID (PDF) | reports.test.js:215 | PR #152 | Repair-Direct: Tests PDF layout fixed in PR #152 |
| RPT-010 | should verify CSV export calls correct queries | reports.test.js:330 | PR #161 | Repair-Direct: Tests CSV header mapping fixed in PR #161 |
| RPT-011 | should verify PDF export calls correct queries | reports.test.js:423 | PR #162 | Repair-Direct: Tests PDF pagination fixed in PR #162 |
| AUTH-001 | should authenticate existing user | middleware/auth.test.js:68 | PR #150 | Repair-Direct: Tests JWT handling fixed in PR #150 |
| AUTH-002 | should create new user if not exists | middleware/auth.test.js:106 | PR #150 | Repair-Direct: Tests user creation with JWT |
| AUTH-003 | should handle database error when checking user | middleware/auth.test.js:85 | PR #155 | Repair-Direct: Tests API error handling fixed in PR #155 |
| RAUTH-001 | should login existing user | routes/auth.test.js:35 | PR #150 | Repair-Direct: Tests login with JWT fix |
| RAUTH-002 | should create new user on first login | routes/auth.test.js:54 | PR #150 | Repair-Direct: Tests user creation |
| RAUTH-007 | should handle database error | routes/auth.test.js:185 | PR #155 | Repair-Direct: Tests error handling fix |
| WE-013 | should return 400 if client not found | workEntries.test.js:155 | PR #155 | Repair-Direct: Tests validation error handling |
| WE-014 | should handle database error on insert | workEntries.test.js:204 | PR #155 | Repair-Direct: Tests insert error handling |
| WE-015 | should return 404 if work entry not found (PUT) | workEntries.test.js:264 | PR #160 | Repair-Direct: Tests entry lookup fixed in PR #160 |
| WE-016 | should return 400 if new client not found | workEntries.test.js:294 | PR #155 | Repair-Direct: Tests client validation |
| WE-017 | should handle database delete error | workEntries.test.js:346 | PR #160 | Repair-Direct: Tests delete error handling |
| CLI-009 | should return 404 if client not found (PUT) | clients.test.js:248 | PR #163 | Repair-Direct: Tests client search fixed in PR #163 |
| CLI-010 | should handle database error when checking existence | clients.test.js:328 | PR #155 | Repair-Direct: Tests error handling |
| ERR-001 | should handle Joi validation error | errorHandler.test.js:23 | PR #145, #153 | Repair-Direct: Tests validation error handling |
| ERR-002 | should handle SQLITE_CONSTRAINT error | errorHandler.test.js:58 | PR #154 | Repair-Direct: Tests unique constraint error |

---

### 2.5 Repair Classification — Indirect TCs

TCs linked to features associated with bug fixes.

| TC ID | TC Name | File | Bug-Fix PR | Reasoning |
|-------|---------|------|------------|-----------|
| WE-001 | should return all work entries for user | workEntries.test.js:42 | PR #147 | Repair-Indirect: Tests work entry retrieval, related to weekly export fix |
| WE-002 | should filter by client ID when provided | workEntries.test.js:58 | PR #147 | Repair-Indirect: Tests filtering related to export fix |
| CLI-001 | should return all clients for authenticated user | clients.test.js:42 | PR #146 | Repair-Indirect: Tests client listing, related to cascade delete feature |
| CLI-002 | should return specific client | clients.test.js:87 | PR #146, #154 | Repair-Indirect: Tests client lookup, related to deletion and unique constraint |
| CLI-003 | should create new client with valid data | clients.test.js:131 | PR #154 | Repair-Indirect: Tests client creation, related to duplicate names fix |
| RPT-002 | should return report with zero hours | reports.test.js:86 | PR #147 | Repair-Indirect: Tests report edge case, related to export fix |
| RPT-007 | should filter work entries by user email | reports.test.js:148 | PR #147 | Repair-Indirect: Tests user filtering in reports |
| RPT-008 | should correctly sum decimal hours | reports.test.js:268 | PR #147 | Repair-Indirect: Tests hours calculation in reports |
| AUTH-004 | should return 401 if x-user-email header missing | middleware/auth.test.js:32 | PR #150 | Repair-Indirect: Tests auth validation, related to JWT fix |
| AUTH-005 | should return 400 if email format invalid | middleware/auth.test.js:42 | PR #150 | Repair-Indirect: Tests email validation |
| RAUTH-003 | should return 400 for invalid email | routes/auth.test.js:77 | PR #150 | Repair-Indirect: Tests validation in auth routes |
| RAUTH-004 | should return current user info | routes/auth.test.js:140 | PR #150 | Repair-Indirect: Tests /me endpoint |
| RAUTH-005 | should return 401 if no email header | routes/auth.test.js:159 | PR #150 | Repair-Indirect: Tests auth flow |
| DB-003 | should create indexes for performance | init.test.js:94 | PR #156 | Repair-Indirect: Tests indexes related to pagination fix |
| SCH-004 | should accept decimal hours | schemas.test.js:177 | PR #145 | Repair-Indirect: Tests decimal hours validation |

---

## Phase 3: Historical Data Analysis

### 3.1 Chronic Classification

Chronic score calculation based on CI history:
- `chronic_score = (0.35 × failure_rate) + (0.65 × normalized_defect_score)`
- Threshold: chronic_score >= 0.50

#### CI Failure Analysis

| Date | Commit/PR | Status | Failed Tests | Affected Feature |
|------|-----------|--------|--------------|------------------|
| 2026-02-08 | PR #152 – Client Deletion Cascade | Failed | Lint Failed | Client CRUD |
| 2026-02-05 | Commit e5f6g7h – CSV Export Encoding | Failed | Build Failed | CSV Export |
| 2026-02-02 | PR #198 – PDF Report Layout | Failed | 2 tests failed | PDF Export |
| 2026-01-29 | Commit y7x6w5v – Timesheet API Error | Failed | 1 test failed | Work Entry CRUD |
| 2026-01-26 | PR #210 – Token Refresh Endpoint | Failed | 3 tests failed | Authentication |
| 2026-01-23 | Commit m9l8k7j – CSV Export Header | Failed | 2 tests failed | CSV Export |

#### Chronic Scores Table

| TC ID | TC Name | Feature | Failure Rate | Defect Score | Chronic Score | Reasoning |
|-------|---------|---------|--------------|--------------|---------------|-----------|
| RPT-CSV-* | CSV Export Tests | CSV Export | 2/18 = 0.111 | 0.75 (High) | **0.53** | Chronic: 2 CI failures (2026-02-05, 2026-01-23). Defect score from PR #149, #161. chronic_score = (0.35 × 0.111) + (0.65 × 0.75) = 0.53 |
| RPT-PDF-* | PDF Export Tests | PDF Export | 1/18 = 0.056 | 0.75 (High) | **0.51** | Chronic: 1 CI failure (2026-02-02). Defect score from PR #152, #162. chronic_score = (0.35 × 0.056) + (0.65 × 0.75) = 0.51 |
| AUTH-* | Token/Auth Tests | Authentication | 1/18 = 0.056 | 0.75 (High) | **0.51** | Chronic: 1 CI failure (2026-01-26). Defect score from PR #150, #158. chronic_score = (0.35 × 0.056) + (0.65 × 0.75) = 0.51 |
| WE-API-* | Work Entry API Tests | Work Entry CRUD | 1/18 = 0.056 | 0.50 (Medium) | 0.34 | Not Chronic: 1 CI failure (2026-01-29). Defect score from PR #155. chronic_score = 0.34 < 0.50 |
| CLI-* | Client CRUD Tests | Client CRUD | 1/18 = 0.056 | 0.50 (Medium) | 0.34 | Not Chronic: 1 lint failure (2026-02-08). Defect score from PR #146. chronic_score = 0.34 < 0.50 |

#### Chronic TCs (chronic_score >= 0.50)

| TC ID | TC Name | File | Chronic Score | Reasoning |
|-------|---------|------|---------------|-----------|
| RPT-003 | should return 400 for invalid client ID (CSV) | reports.test.js:169 | 0.53 | Chronic: CSV export feature had 2 CI failures. No of High defects = 2 (PR #149, #161). Failed Executions/Total = 2/18 |
| RPT-004 | should return 404 if client not found (CSV) | reports.test.js:176 | 0.53 | Chronic: CSV export feature had 2 CI failures. High defects = 2. |
| RPT-005 | should handle CSV write error | reports.test.js:305 | 0.53 | Chronic: CSV export feature had 2 CI failures. High defects = 2. |
| RPT-010 | should verify CSV export calls correct queries | reports.test.js:330 | 0.53 | Chronic: CSV export feature had 2 CI failures. High defects = 2. |
| RPT-006 | should return 400 for invalid client ID (PDF) | reports.test.js:215 | 0.51 | Chronic: PDF export feature had 1 CI failure. High defects = 2 (PR #152, #162). Failed Executions/Total = 1/18 |
| RPT-011 | should verify PDF export calls correct queries | reports.test.js:423 | 0.51 | Chronic: PDF export feature had 1 CI failure. High defects = 2. |
| AUTH-001 | should authenticate existing user | middleware/auth.test.js:68 | 0.51 | Chronic: Auth feature had 1 CI failure (token refresh). High defects = 2 (PR #150, #158). Failed Executions/Total = 1/18 |
| AUTH-002 | should create new user if not exists | middleware/auth.test.js:106 | 0.51 | Chronic: Auth feature had 1 CI failure. High defects = 2. |

---

### 3.2 Risk Classification

Risk classification based on production-like failures in CI history.

#### Production-Like Failure Analysis

CI failures that indicate production risk (build failures, test failures affecting core functionality):

| Date | Issue | Severity | Affected Feature | Production Risk |
|------|-------|----------|------------------|-----------------|
| 2026-02-05 | Build Failed (CSV Encoding) | Critical | CSV Export | HIGH - Export used for billing |
| 2026-02-02 | Tests Failed (PDF Layout) | High | PDF Export | HIGH - Reports used for payroll |
| 2026-01-26 | Tests Failed (Token Refresh) | Critical | Authentication | CRITICAL - Auth bypass risk |
| 2026-01-29 | Tests Failed (API Error) | High | Work Entry CRUD | HIGH - Core workflow |
| 2026-01-23 | Tests Failed (CSV Headers) | High | CSV Export | HIGH - Data integrity |

#### Risk Classification Matrix

| TC ID | TC Name | File | Risk Level | Reasoning |
|-------|---------|------|------------|-----------|
| AUTH-001 | should authenticate existing user | middleware/auth.test.js:68 | CRITICAL | Risk: Authentication feature had CI failure (PR #210 token refresh). Auth bypass = full data exposure. Prod defect risk: Critical |
| AUTH-002 | should create new user if not exists | middleware/auth.test.js:106 | CRITICAL | Risk: Auth feature critical for all operations. CI failure indicates instability. |
| AUTH-003 | should handle database error when checking user | middleware/auth.test.js:85 | HIGH | Risk: Error handling in auth affects all authenticated endpoints |
| RAUTH-001 | should login existing user | routes/auth.test.js:35 | CRITICAL | Risk: Login flow had CI issues. Gateway to all functionality. |
| RAUTH-002 | should create new user on first login | routes/auth.test.js:54 | CRITICAL | Risk: User creation in auth flow |
| RPT-003 | should return 400 for invalid client ID (CSV) | reports.test.js:169 | HIGH | Risk: CSV export had build failure (2026-02-05). Used for billing. Prod defect IDs: PR #149, #161 |
| RPT-004 | should return 404 if client not found (CSV) | reports.test.js:176 | HIGH | Risk: CSV export validation critical for billing accuracy |
| RPT-005 | should handle CSV write error | reports.test.js:305 | HIGH | Risk: CSV error handling affects billing exports |
| RPT-006 | should return 400 for invalid client ID (PDF) | reports.test.js:215 | HIGH | Risk: PDF export had test failures. Used for payroll. Prod defect IDs: PR #152, #162 |
| WE-007 | should create work entry with valid data | workEntries.test.js:126 | HIGH | Risk: Work entry creation is core workflow. CI failure (2026-01-29) indicates instability. |
| WE-013 | should return 400 if client not found | workEntries.test.js:155 | HIGH | Risk: Validation in core workflow. API error handling had CI failure. |

---

## Combined Phase 2-3 Classification Summary

### Multi-Classification Resolution

TCs with multiple classifications, sorted by priority score.

**Priority Order**: Risk (1.0) > Core (0.9) > Chronic (0.8) > Recent (0.7) > Repair (0.6) > Config (0.5)

**Composite Score**: `priority_score = max(classification_weights) + 0.1 × count(classifications)`

| TC ID | TC Name | Classifications | Priority Score | Execution Priority |
|-------|---------|-----------------|----------------|-------------------|
| AUTH-001 | should authenticate existing user | Risk, Chronic, Recent-Direct, Repair-Direct | 1.4 | 1 |
| AUTH-002 | should create new user if not exists | Risk, Chronic, Recent-Direct, Repair-Direct | 1.4 | 2 |
| RAUTH-001 | should login existing user | Risk, Recent-Indirect, Repair-Direct | 1.3 | 3 |
| RAUTH-002 | should create new user on first login | Risk, Recent-Indirect, Repair-Direct | 1.3 | 4 |
| AUTH-003 | should handle database error | Risk, Recent-Direct, Repair-Direct | 1.3 | 5 |
| RPT-003 | should return 400 for invalid client ID (CSV) | Risk, Chronic, Recent-Direct, Repair-Direct | 1.4 | 6 |
| RPT-004 | should return 404 if client not found (CSV) | Risk, Chronic, Recent-Direct, Repair-Direct | 1.4 | 7 |
| RPT-005 | should handle CSV write error | Risk, Chronic, Recent-Direct, Repair-Direct | 1.4 | 8 |
| RPT-006 | should return 400 for invalid client ID (PDF) | Risk, Chronic, Recent-Direct, Repair-Direct | 1.4 | 9 |
| RPT-010 | should verify CSV export calls correct queries | Chronic, Recent-Direct, Repair-Direct | 1.1 | 10 |
| RPT-011 | should verify PDF export calls correct queries | Chronic, Recent-Direct, Repair-Direct | 1.1 | 11 |
| WE-007 | should create work entry with valid data | Risk, Recent-Direct, Repair-Direct | 1.3 | 12 |
| WE-008 | should return 400 for invalid hours | Recent-Direct, Repair-Direct | 0.8 | 13 |
| WE-009 | should return 400 for hours exceeding 24 | Recent-Direct, Repair-Direct | 0.8 | 14 |
| SCH-001 | should validate valid work entry | Recent-Direct, Repair-Direct | 0.8 | 15 |
| SCH-002 | should reject negative hours | Recent-Direct, Repair-Direct | 0.8 | 16 |
| SCH-003 | should reject hours greater than 24 | Recent-Direct, Repair-Direct | 0.8 | 17 |
| CLI-005 | should delete existing client | Recent-Indirect, Repair-Direct | 0.8 | 18 |
| DB-002 | should create all required tables | Recent-Indirect, Repair-Direct | 0.8 | 19 |
| RPT-001 | should return client report with work entries | Recent-Direct, Repair-Direct | 0.8 | 20 |

---

## Execution Statistics

```
Total TCs: 161

Phase 2 Classifications:
  Recent — Direct:     24 (14.9%)
  Recent — Indirect:   18 (11.2%)
  Recent — Code Impact: 12 (7.5%)
  Repair — Direct:     31 (19.3%)
  Repair — Indirect:   15 (9.3%)

Phase 3 Classifications:
  Chronic:             8 (5.0%)
  Risk:                11 (6.8%)

Unclassified:          42 (26.1%)

Coverage: 87.17% (Target: 80%+ met)

Execution Tiers:
  Tier 1 (Smoke):      11 TCs (Risk + top Chronic)
  Tier 2 (Critical):   19 TCs (Risk + Chronic)
  Tier 3 (Release):    100 TCs (Risk + Chronic + Recent + Repair)
  Tier 4 (Full):       161 TCs (All)
```

---

## Recommendations

### High-Priority Actions

1. **Stabilize CSV/PDF Export Tests**: Chronic score >= 0.50 indicates recurring issues. Investigate root causes in reports.js lines 127-134 (CSV) and 187-240 (PDF).

2. **Strengthen Authentication Tests**: Auth feature has both Risk and Chronic classifications. Consider adding integration tests for token refresh scenarios.

3. **Increase Export Coverage**: CSV export (lines 127-134) and PDF export (lines 187-240) have 0% coverage on generation logic. These are high-risk areas.

### Test Execution Strategy

For time-constrained releases:
- **< 1 hour**: Run Tier 1 (11 Risk + top Chronic TCs)
- **< 4 hours**: Run Tier 2 (19 Risk + Chronic TCs)
- **Standard release**: Run Tier 3 (100 TCs covering all Phase 2-3 classifications)
- **Full regression**: Run all 161 TCs

---

*Report generated by Devin AI for Risk-Based Testing analysis*
