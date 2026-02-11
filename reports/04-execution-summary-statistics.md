# Execution Summary Statistics

> **Repository**: Cognition-Partner-Workshops/client-timesheet-app
> **Analysis Date**: 2026-02-11
> **Release**: v3.1.0
> **Analyzer**: RCRCR Risk-Based Testing Framework

---

## Total Test Cases by Classification

```
Total TCs: 161

  Core:         139  (86.3%)  ████████████████████████████████████████░░░░░░
  Recent:        56  (34.8%)  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    Direct:      55  (34.2%)
    Indirect:     1  ( 0.6%)
    Code Impact:  0  ( 0.0%)
  Repair:        19  (11.8%)  █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    Direct:      15  ( 9.3%)
    Indirect:     4  ( 2.5%)
  Chronic:       12  ( 7.5%)  ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Config:        30  (18.6%)  █████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Risk:           0  ( 0.0%)  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  Unclassified:   7  ( 4.3%)  ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

> **Note**: TCs can have multiple classifications. Individual counts exceed 161 because of multi-classification. Risk = 0 because no production incident data was provided; code-level risk areas are captured in coverage gaps and new TC recommendations.

---

## Coverage vs Target

| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| Overall Statement Coverage | 87.17% | >= 80% | PASS |
| Overall Branch Coverage | 77.27% | >= 60% | PASS |
| Overall Function Coverage | 87.50% | >= 65% | PASS |
| Overall Line Coverage | 87.17% | >= 60% | PASS |
| Core Feature Coverage (avg) | 89.4% | >= 90% | NEAR TARGET |
| Reports Module Coverage | 64.15% | >= 80% | FAIL |

### Per-Module Coverage

| Module | Stmts | Branch | Funcs | Lines | Status |
|--------|-------|--------|-------|-------|--------|
| middleware/auth.js | 100% | 100% | 100% | 100% | PASS |
| middleware/errorHandler.js | 100% | 100% | 100% | 100% | PASS |
| routes/auth.js | 100% | 100% | 100% | 100% | PASS |
| validation/schemas.js | 100% | 100% | 100% | 100% | PASS |
| routes/workEntries.js | 94.73% | 84.61% | 100% | 94.73% | PASS |
| routes/clients.js | 88.88% | 78.57% | 100% | 88.88% | PASS |
| database/init.js | 85.71% | 76.92% | 100% | 85.71% | PASS |
| **routes/reports.js** | **64.15%** | **50.00%** | **100%** | **64.15%** | **FAIL** |

---

## Tier-Based Execution Plan

### Tier 1 — Smoke (< 1 hour available)
**Scope**: Risk + Core (top 20% by priority score)
**TC Count**: 32 TCs
**Estimated Time**: 30-45 minutes

| Priority Range | Count | Key Areas |
|---------------|-------|-----------|
| Score >= 1.3 | 10 | CSV/PDF export (Chronic), DB init, JSON reports |
| Score >= 1.2 | 8 | Auth login, client delete cascade, work entry CRUD |
| Score >= 1.1 (top 14) | 14 | Config-sensitive DB/validation tests |

**Includes**: TC086-TC108 (reports), TC001-TC002 (auth), TC023 (clients), TC040 (client delete), TC051 (work entries), TC058 (work entry create), TC117 (DB init)

---

### Tier 2 — Critical (< 4 hours available)
**Scope**: Risk + Core + Chronic
**TC Count**: 139 TCs (all Core) + 12 Chronic (overlap)
**Estimated Time**: 2-3 hours

| Classification | Count | Notes |
|---------------|-------|-------|
| Core | 139 | All business-critical TCs |
| Chronic (additional) | 0 | All Chronic TCs are already Core |
| **Total unique** | **139** | |

**Adds over Tier 1**: All remaining Core TCs for client CRUD (TC024-TC050), work entry CRUD (TC052-TC085), remaining auth (TC003-TC022), database schema (TC120-TC129)

---

### Tier 3 — Release (Standard release cycle)
**Scope**: Risk + Core + Chronic + Recent + Repair
**TC Count**: 154 TCs
**Estimated Time**: 4-6 hours

| Classification | Count | Notes |
|---------------|-------|-------|
| All Tier 2 TCs | 139 | Core + Chronic |
| Recent-Direct (additional) | 15 | Validation schema TCs not already Core |
| Repair (additional) | 0 | All Repair TCs are already Core |
| **Total unique** | **154** | |

**Adds over Tier 2**: TC130-TC161 (validation schema tests for schemas.js changes in release)

---

### Tier 4 — Full Regression
**Scope**: All classifications including Unclassified
**TC Count**: 161 TCs (all)
**Estimated Time**: 6-8 hours

| Classification | Count | Notes |
|---------------|-------|-------|
| All Tier 3 TCs | 154 | Core + Chronic + Recent + Repair |
| Config (additional) | 0 | All Config TCs are already Core or Recent |
| Unclassified | 7 | Error handler utility tests |
| **Total unique** | **161** | |

**Adds over Tier 3**: TC109-TC116 (error handler middleware tests), TC122 (logging test)

---

## Classification Scoring Summary

### Priority Score Distribution

| Score Range | Count | Description |
|-------------|-------|-------------|
| 1.4 | 6 | 5-classification TCs (CSV/PDF export with Chronic + Config) |
| 1.3 | 5 | 4-classification TCs (reports, DB init) |
| 1.2 | 8 | 3-classification TCs (auth, client CRUD, work entries) |
| 1.1 | 26 | 2-classification TCs (Core + Config, Core + Repair) |
| 1.0 | 78 | Single-classification Core TCs |
| 0.9 | 3 | Recent-Direct + Repair-Direct (validation) |
| 0.8 | 26 | Recent-Direct only (validation schemas) |
| 0.6 | 2 | Config only (SQLite error handler) |
| 0.1 | 7 | Unclassified (error handler utility, logging) |

### Chronic Score Distribution

| Score | Count | Feature Area |
|-------|-------|-------------|
| 0.58 | 10 | CSV/PDF export TCs (reports.js) |
| 0.52 | 2 | JSON report TCs (reports.js) |
| < 0.50 | 149 | Not Chronic |

---

## Scoring Configuration Used

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

---

## New TCs Recommended

| Area | Count | Priority | Projected Coverage Impact |
|------|-------|----------|--------------------------|
| CSV Export (end-to-end) | 5 | P1-P3 | reports.js: 64% -> ~85% |
| PDF Export (generation) | 5 | P1-P2 | reports.js: ~85% -> ~92% |
| Bulk Client Delete | 3 | P1-P3 | clients.js: 88% -> ~96% |
| Database Close Polling | 2 | P4 | init.js: 85% -> ~95% |
| **Total** | **15** | | **Overall: 87% -> ~93%** |

---

## Key Findings

1. **Reports module is the highest-risk area**: 64.15% coverage with 7 bug-fix PRs and 4 CI failures in 19 runs. CSV and PDF export logic is largely untested despite being business-critical for billing.

2. **No production incident data available**: Risk classification could not be applied. Code-level risk analysis identified reports.js as the primary risk area based on low coverage + high complexity + file I/O operations.

3. **Chronic concentration in reports module**: All 12 Chronic TCs are in the reports test suite, reflecting the module's history of bugs and CI failures.

4. **High Core classification rate (86.3%)**: The application is a focused timesheet/billing tool where most features are business-critical. This is appropriate for the domain.

5. **Validation schemas fully covered**: 100% coverage on schemas.js with 32 TCs, but all are classified as Recent-Direct due to modifications in PR #145 and PR #153.

6. **Data isolation is well-tested**: All route handlers include user email filtering, verified by dedicated tests across auth, clients, work entries, and reports modules.

7. **Frontend has no backend tests**: React pages (LoginPage, DashboardPage, ClientsPage, WorkEntriesPage, ReportsPage) are outside the scope of the backend test suite. Frontend testing should be addressed separately.
