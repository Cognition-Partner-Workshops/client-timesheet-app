# RCRCR Summary Dashboard

> **Repository**: Cognition-Partner-Workshops/client-timesheet-app
> **Analysis Date**: 2026-02-11
> **Release**: v3.1.0
> **Tech Stack**: React 19 + Express.js + SQLite + Docker

---

## Overall Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Total Test Cases | 161 | - |
| All Tests Passing | 161/161 | PASS |
| Overall Code Coverage | 87.17% | PASS (Target: 80%+) |
| Statement Coverage | 87.17% | PASS |
| Branch Coverage | 77.27% | PASS |
| Function Coverage | 87.5% | PASS |
| Line Coverage | 87.17% | PASS |

---

## Classification Distribution

| Classification | TC Count | Percentage | Description |
|---------------|----------|------------|-------------|
| **Core** | 139 | 86.3% | Business-critical features (auth, CRUD, data integrity, billing, export) |
| **Recent-Direct** | 55 | 34.2% | TCs directly testing files modified in v3.1.0 release |
| **Recent-Indirect** | 1 | 0.6% | TCs testing modules dependent on changed files |
| **Repair-Direct** | 15 | 9.3% | TCs covering code paths fixed by bug-fix PRs |
| **Repair-Indirect** | 4 | 2.5% | TCs testing features related to bug fixes |
| **Chronic** | 12 | 7.5% | TCs with chronic_score >= 0.50 (historically failing) |
| **Config** | 30 | 18.6% | TCs covering environment-sensitive code paths |
| **Unclassified** | 7 | 4.3% | Error handler utility and logging tests |

> **Note**: TCs can have multiple classifications. Percentages do not sum to 100%.

### Classification Overlap Analysis

| Multi-Classification Pattern | Count | Priority Score Range |
|------------------------------|-------|---------------------|
| Core + Recent-Direct + Repair-Direct + Chronic + Config | 6 | 1.4 |
| Core + Recent-Direct + Repair-Direct | 4 | 1.2 |
| Core + Recent-Direct + Chronic + Config | 4 | 1.3 |
| Core + Recent-Direct + Chronic | 2 | 1.2 |
| Core + Config | 20 | 1.1 |
| Core only | 72 | 1.0 |
| Recent-Direct only | 26 | 0.8 |
| Config only | 2 | 0.6 |
| Unclassified | 7 | 0.1 |

---

## Top 10 Highest-Priority Test Cases

| Rank | TC ID | TC Name | Priority Score | Classifications | Reasoning |
|------|-------|---------|---------------|----------------|-----------|
| 1 | TC093 | should return 400 for invalid client ID (CSV export) | 1.4 | Core, Recent-Direct, Repair-Direct, Chronic, Config | Core: CSV export is billing-critical. Repair-Direct: PR #149 fixed encoding, PR #161 fixed headers. Chronic: score 0.58. Config: temp file I/O. |
| 2 | TC094 | should return 404 if client not found (CSV export) | 1.4 | Core, Recent-Direct, Repair-Direct, Chronic, Config | Core: Data isolation on CSV. Repair-Direct: PR #149, #161. Chronic: score 0.58. Config: file system operations. |
| 3 | TC097 | should return 400 for invalid client ID (PDF export) | 1.4 | Core, Recent-Direct, Repair-Direct, Chronic, Config | Core: PDF billing endpoint validation. Repair-Direct: PR #152 fixed layout, PR #162 fixed pagination. Chronic: score 0.58. Config: PDFKit streams. |
| 4 | TC098 | should return 404 if client not found (PDF export) | 1.4 | Core, Recent-Direct, Repair-Direct, Chronic, Config | Core: Data isolation on PDF. Repair-Direct: PR #152, #162. Chronic: score 0.58. Config: stream handling. |
| 5 | TC103 | should handle CSV write error | 1.4 | Core, Recent-Direct, Repair-Direct, Chronic, Config | Core: Error handling for CSV generation. Repair-Direct: PR #149, #161. Chronic: score 0.58. Config: file I/O. |
| 6 | TC086 | should return client report with work entries | 1.3 | Core, Recent-Direct, Repair-Direct, Chronic | Core: JSON report for billing. Repair-Direct: PR #147, #152, #156. Chronic: score 0.52. |
| 7 | TC117 | should create and return database instance | 1.3 | Core, Config, Recent-Direct, Repair-Direct | Core: Foundational DB singleton. Config: DATABASE_PATH env var. Repair-Direct: PR #146 fixed cascade. |
| 8 | TC095 | should handle database error when fetching client (CSV) | 1.3 | Core, Recent-Direct, Chronic, Config | Core: Error resilience on CSV. Chronic: score 0.58. Config: DB + filesystem. |
| 9 | TC096 | should handle database error when fetching work entries (CSV) | 1.3 | Core, Recent-Direct, Chronic, Config | Core: Error resilience on CSV data. Chronic: score 0.58. Config: DB connectivity. |
| 10 | TC099 | should handle database error (PDF export) | 1.3 | Core, Recent-Direct, Chronic, Config | Core: Error handling on PDF. Chronic: score 0.58. Config: DB + stream operations. |

---

## Chronic Test Cases

### Chronic Scoring Methodology

```
chronic_score = (0.35 x failure_rate) + (0.65 x normalized_defect_score)
Threshold: chronic_score >= 0.50
```

### Source Data Analysis

**CI Pipeline History** (19 runs analyzed, 2026-01-22 to 2026-02-09):
- Total Runs: 19
- Failed Runs: 6 (31.6% overall failure rate)
- Test Failures: 4 runs with test failures (PR #198, Commit y7x6w5v, PR #210, Commit m9l8k7j)

**Bug-Fix PRs affecting reports.js**: 7 PRs (PR #147, #149, #152, #156, #157, #161, #162)

### Chronic TCs (chronic_score >= 0.50)

| TC ID | TC Name | Chronic Score | Failure Rate | Defect Score | Linked Defects |
|-------|---------|--------------|-------------|-------------|----------------|
| TC093 | CSV export - invalid client ID | 0.58 | 0.21 (4/19) | 0.77 | PR #149 (encoding), PR #161 (headers) |
| TC094 | CSV export - client not found | 0.58 | 0.21 | 0.77 | PR #149, PR #161 |
| TC095 | CSV export - DB error fetching client | 0.58 | 0.21 | 0.77 | PR #149, PR #161 |
| TC096 | CSV export - DB error fetching entries | 0.58 | 0.21 | 0.77 | PR #149, PR #161 |
| TC097 | PDF export - invalid client ID | 0.58 | 0.21 | 0.77 | PR #152 (layout), PR #162 (pagination) |
| TC098 | PDF export - client not found | 0.58 | 0.21 | 0.77 | PR #152, PR #162 |
| TC099 | PDF export - DB error | 0.58 | 0.21 | 0.77 | PR #152, PR #162 |
| TC103 | CSV write error | 0.58 | 0.21 | 0.77 | PR #149, PR #161 |
| TC104 | CSV export DB queries | 0.58 | 0.21 | 0.77 | PR #149, PR #161 |
| TC107 | PDF export - DB error work entries | 0.58 | 0.21 | 0.77 | PR #152, PR #162 |
| TC108 | PDF export DB queries | 0.58 | 0.21 | 0.77 | PR #152, PR #162 |
| TC086 | Client report with work entries | 0.52 | 0.21 | 0.65 | PR #147 (weekly export), PR #156 (pagination), PR #157 (sorting) |

**Chronic Score Calculation Detail (CSV/PDF export TCs)**:
- `failure_rate` = 4/19 = 0.211 (4 CI runs had test failures linked to reports module)
- `defect_score` = (2 High x 0.75) / max_possible = 1.5/1.95 = 0.77 (2 High-severity defects from bug-fix PRs)
- `chronic_score` = (0.35 x 0.211) + (0.65 x 0.77) = 0.074 + 0.500 = **0.58**

---

## Coverage Gap Analysis

### Per-File Coverage

| File | Statements | Branches | Functions | Lines | Risk Level |
|------|-----------|----------|-----------|-------|-----------|
| routes/reports.js | 64.15% | 50% | 100% | 64.15% | **CRITICAL** |
| routes/clients.js | 88.88% | 78.57% | 100% | 88.88% | Low |
| database/init.js | 85.71% | 76.92% | 100% | 85.71% | Low |
| routes/auth.js | 100% | 100% | 100% | 100% | None |
| routes/workEntries.js | 94.73% | 84.61% | 100% | 94.73% | None |
| validation/schemas.js | 100% | 100% | 100% | 100% | None |
| middleware/auth.js | 100% | 100% | 100% | 100% | None |
| middleware/errorHandler.js | 100% | 100% | 100% | 100% | None |

### Critical Coverage Gaps

#### 1. reports.js CSV Export (Lines 67-147) - CRITICAL
- **Coverage**: ~64.15% (CSV write/cleanup logic at lines 127-134 untested)
- **Risk**: File I/O operations, temp file creation/deletion, stream handling
- **Business Impact**: CSV export is used for client billing and payroll integration
- **Bug History**: 2 bug-fix PRs (PR #149 encoding, PR #161 header mismatch)
- **Untested Paths**:
  - CSV file write success path (actual file generation)
  - File download response handling
  - Temp file cleanup after download
  - Error during file send

#### 2. reports.js PDF Export (Lines 150-245) - CRITICAL
- **Coverage**: ~64.15% (PDF generation logic at lines 187-240 untested)
- **Risk**: Stream handling, PDFKit document generation, pagination
- **Business Impact**: PDF reports for client billing and regulatory compliance
- **Bug History**: 2 bug-fix PRs (PR #152 layout, PR #162 pagination)
- **Untested Paths**:
  - PDF document construction and styling
  - Page break handling (line 227-228)
  - Table row rendering with separators
  - Stream pipe to response

#### 3. clients.js Bulk Delete (Lines 189-207) - MEDIUM
- **Coverage**: 88.88% (bulk DELETE endpoint untested)
- **Risk**: Bulk delete operation without individual record validation
- **Business Impact**: Could accidentally delete all client data
- **Untested Paths**:
  - DELETE / route (delete all clients for user)
  - Success response with deletedCount
  - Database error during bulk delete

#### 4. database/init.js Close Polling (Lines 91-97) - LOW
- **Coverage**: 85.71% (polling logic in closeDatabase untested)
- **Risk**: Race condition in concurrent close calls
- **Untested Paths**:
  - Polling interval for concurrent close operations
  - Edge case with isClosing flag

### Frontend Coverage Gap - NO BACKEND TESTS

The following frontend pages have no backend test coverage:
- `LoginPage.tsx` - UI login flow
- `DashboardPage.tsx` - Dashboard rendering
- `ClientsPage.tsx` - Client management UI
- `WorkEntriesPage.tsx` - Work entry management UI
- `ReportsPage.tsx` - Report viewing UI
- `AuthContext.tsx` - Authentication state management

> **Note**: Frontend is built with React 19 and tested separately. This analysis focuses on backend test coverage.

---

## Release Impact Summary (v3.1.0)

### Changed Files in Release

| File | PRs Affecting | Bug-Fix PRs | Change Type |
|------|--------------|-------------|-------------|
| reports.js | #147, #149, #152, #156, #157, #161, #162 | 7 | Heavy modification |
| schemas.js | #145, #153 | 2 | Validation rules |
| workEntries.js | #145, #155 | 2 | API validation |
| database/init.js | #146, #154 | 2 | Schema/constraints |
| middleware/auth.js | #150 | 1 | JWT handling |
| auth.js | #158 | 1 | Token refresh |
| clients.js | #163 | 1 | Search query |

### Bug-Fix PR Impact Analysis

| Category | Count | Files Affected |
|----------|-------|---------------|
| Report Export Bugs | 7 PRs | reports.js |
| Validation Bugs | 2 PRs | schemas.js |
| Data Integrity Bugs | 2 PRs | database/init.js |
| Auth Bugs | 2 PRs | auth.js, middleware/auth.js |
| API Error Handling | 2 PRs | workEntries.js |
| Client Search | 1 PR | clients.js |
| UI Bugs | 4 PRs | Frontend files (not in backend scope) |
