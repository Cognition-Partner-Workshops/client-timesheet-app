# Synthetic QA Test Data - Documentation

## Overview

100 rows of synthetic test data generated from statistical analysis of 2-day application logs (2026-02-07 to 2026-02-09). The dataset mirrors observed production traffic patterns while maintaining complete PII compliance.

## Log Analysis Summary

| Metric | Observed Value |
|--------|---------------|
| Total HTTP requests | 100 |
| Total log lines | 184 |
| Analysis period | 2026-02-07 to 2026-02-09 |

### HTTP Method Distribution

| Method | Count | Percentage |
|--------|-------|-----------|
| POST | 67 | 67.0% |
| GET | 30 | 30.0% |
| PUT | 3 | 3.0% |

### API Endpoint Traffic Distribution

| Endpoint Group | Count | Percentage |
|----------------|-------|-----------|
| Work Entries | 37 | 37.0% |
| Auth | 22 | 22.0% |
| Clients | 17 | 17.0% |
| Reports | 17 | 17.0% |
| Health | 5 | 5.0% |
| Other/404 | 2 | 2.0% |

### Status Code Distribution

| Status | Count | Percentage |
|--------|-------|-----------|
| 201 Created | 48 | 48.0% |
| 200 OK | 37 | 37.0% |
| 400 Bad Request | 9 | 9.0% |
| 404 Not Found | 5 | 5.0% |
| 401 Unauthorized | 1 | 1.0% |

### Error Rate Analysis

| Error Type | Rate | Count |
|------------|------|-------|
| Overall error rate | 15.0% | 15 |
| Validation (400) | 9.0% | 9 |
| Not Found (404) | 5.0% | 5 |
| Unauthorized (401) | 1.0% | 1 |

## Synthetic Data Distribution (100 Rows)

| Entity | Count | Rationale |
|--------|-------|-----------|
| Users | 12 | 8 observed unique users + 50% growth factor |
| Clients | 18 | Matches observed 2-8 clients/user range |
| Work Entries | 70 | Matches dominant 40% traffic share |
| **Total** | **100** | |

### User Activity Pattern

| User Type | Count | Clients | Work Entries | Login Frequency |
|-----------|-------|---------|-------------|-----------------|
| Power Users | 2 | 5-8 each | 30-35 each | 5+ logins/2 days |
| Casual Users | 4 | 2-3 each | 3-7 each | 1-3 logins/2 days |
| Inactive Users | 6 | 0 | 0 | Login only |

### Work Entry Hours Distribution

| Statistic | Observed | Synthetic |
|-----------|----------|-----------|
| Minimum | 0.5 | 0.5 |
| Maximum | 8.0 | 8.0 |
| Mean | 3.74 | ~3.93 |
| Std Dev | 2.18 | ~2.1 |

## PII Compliance

All data is fully compliant with PII protection requirements:

1. **Email Addresses**: Use RFC 2606 reserved domains only
   - `@example.com` - IANA reserved, guaranteed non-routable
   - `@test.example.com` - Subdomain of reserved domain
   - Pattern: `qa.{role}{seq}@{domain}`

2. **Company Names**: All fictional, clearly identifiable as test data
   - Falcon Analytics Corp, Summit Cloud Platforms, Meridian Fintech Ltd, etc.
   - No resemblance to real companies

3. **Contact Emails**: Under reserved test domains
   - Pattern: `{role}@{company}-qa.test.example.com`

4. **Descriptions**: All prefixed with "QA ENTRY -" or "QA synthetic client -"

5. **No Real Data**: Zero real names, addresses, phone numbers, SSNs, or financial data

## Files

| File | Description |
|------|-------------|
| `synthetic-qa-data.sql` | 100 SQL INSERT statements |
| `seed-synthetic-qa-data.js` | Node.js seed script with verification |
| `synthetic-qa-test-scenarios.json` | 50 QA test scenarios across 5 categories |
| `log-analysis-report.json` | Full statistical analysis results |
| `QA-SYNTHETIC-DATA-DOCUMENTATION.md` | This file |

## Loading the Data

```bash
cd backend
node test-data/seed-synthetic-qa-data.js
```

The seed script will:
1. Initialize the SQLite database
2. Execute all 100 INSERT statements
3. Report success/error counts
4. Display database summary (users, clients, work entries)
5. Show work entry hours statistics

## QA Test Scenarios

The `synthetic-qa-test-scenarios.json` file contains 50 structured test cases across 5 scenario categories:

1. **AUTH-01 to AUTH-10**: Authentication scenarios (login, validation, unauthorized)
2. **CLI-01 to CLI-10**: Client management (CRUD, validation, authorization)
3. **WRK-01 to WRK-10**: Work entry tracking (create, validate, boundary testing)
4. **RPT-01 to RPT-10**: Report viewing (dense, sparse, cross-user isolation)
5. **EXP-01 to EXP-10**: Data export (CSV, PDF, error handling, isolation)

Each test case includes expected status codes and validation criteria derived from observed log patterns.
