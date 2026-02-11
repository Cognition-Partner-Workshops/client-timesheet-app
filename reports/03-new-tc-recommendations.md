# New Test Case Recommendations

> **Repository**: Cognition-Partner-Workshops/client-timesheet-app
> **Analysis Date**: 2026-02-11
> **Current Coverage**: 87.17% (Target: 80%+)
> **Recommendations**: 15 new TCs across 5 coverage gap areas

---

## Priority 1: CSV Export — End-to-End File Generation (CRITICAL)

**Current Coverage**: 64.15% on reports.js (CSV write/cleanup at lines 127-134 untested)
**Bug History**: PR #149 (encoding), PR #161 (header mismatch)
**Risk**: File I/O, temp file lifecycle, encoding issues

| # | Suggested TC Description | RCRCR Classification | Priority | Effort |
|---|-------------------------|---------------------|----------|--------|
| NTC-01 | should successfully generate and download CSV file with correct headers and content | Core, Config | P1 - Critical | Medium |
| NTC-02 | should handle UTF-8 special characters in CSV export data | Core, Repair-Direct | P1 - Critical | Low |
| NTC-03 | should clean up temp file after successful download | Core, Config | P1 - Critical | Low |
| NTC-04 | should handle file send error during CSV download | Core, Config | P2 - High | Low |
| NTC-05 | should handle temp file cleanup failure gracefully | Config | P3 - Medium | Low |

**Implementation Notes**:
- Tests should exercise the actual `csvWriter.writeRecords()` path (lines 124-135)
- Verify temp file creation in correct directory and cleanup after download
- Test with special characters (accents, CJK, emoji) to prevent encoding regression (PR #149)
- Verify CSV headers match expected format: Date, Hours, Description, Created At (PR #161)

---

## Priority 2: PDF Export — Document Generation Logic (CRITICAL)

**Current Coverage**: 64.15% on reports.js (PDF generation at lines 187-240 untested)
**Bug History**: PR #152 (long names cut off), PR #162 (pagination)
**Risk**: Stream handling, PDFKit layout, page breaks

| # | Suggested TC Description | RCRCR Classification | Priority | Effort |
|---|-------------------------|---------------------|----------|--------|
| NTC-06 | should generate PDF with correct headers, total hours, and entry count | Core, Config | P1 - Critical | Medium |
| NTC-07 | should handle page breaks for large reports (>20 entries) | Core, Repair-Direct | P1 - Critical | Medium |
| NTC-08 | should handle long client names without truncation in PDF | Core, Repair-Direct | P1 - Critical | Low |
| NTC-09 | should add table separators every 5 entries in PDF | Core | P2 - High | Low |
| NTC-10 | should correctly pipe PDF stream to response with proper headers | Core, Config | P2 - High | Low |

**Implementation Notes**:
- Tests should verify PDFKit document construction (lines 198-239)
- Test page break logic at line 227-228 (`if (y > 700) doc.addPage()`)
- Verify Content-Type and Content-Disposition headers set correctly
- Test with client names containing special characters (PR #152 regression)
- Verify 5-entry separator rendering (lines 235-238)

---

## Priority 3: Bulk Client Delete — Data Safety (MEDIUM)

**Current Coverage**: 88.88% on clients.js (DELETE / route at lines 189-207 untested)
**Risk**: Bulk delete without individual record validation, potential data loss

| # | Suggested TC Description | RCRCR Classification | Priority | Effort |
|---|-------------------------|---------------------|----------|--------|
| NTC-11 | should delete all clients for authenticated user and return deletedCount | Core | P2 - High | Low |
| NTC-12 | should not delete clients belonging to other users (data isolation) | Core | P1 - Critical | Low |
| NTC-13 | should handle database error during bulk delete | Core, Config | P3 - Medium | Low |

**Implementation Notes**:
- Tests should verify `DELETE /api/clients` endpoint (line 189)
- Verify `this.changes` returns correct count of deleted records
- Critical: Verify data isolation — ensure `WHERE user_email = ?` filter is applied
- Test error handling when bulk delete fails

---

## Priority 4: Database Close Polling Logic (LOW)

**Current Coverage**: 85.71% on database/init.js (polling at lines 91-97 untested)
**Risk**: Race condition in concurrent close operations

| # | Suggested TC Description | RCRCR Classification | Priority | Effort |
|---|-------------------------|---------------------|----------|--------|
| NTC-14 | should poll and resolve when concurrent close completes | Config | P4 - Low | Medium |
| NTC-15 | should handle polling interval cleanup on close completion | Config | P4 - Low | Low |

**Implementation Notes**:
- Tests should exercise the `isClosing` flag and `setInterval` polling path (lines 88-95)
- Verify `clearInterval` is called when `isClosed` becomes true
- This is a race condition edge case — low business impact but good for stability

---

## Summary

| Priority | Count | Coverage Impact | Effort |
|----------|-------|----------------|--------|
| P1 - Critical | 7 | +15-20% on reports.js | Medium |
| P2 - High | 4 | +5-8% on reports.js, clients.js | Low |
| P3 - Medium | 2 | +2-3% on reports.js, clients.js | Low |
| P4 - Low | 2 | +3-5% on database/init.js | Medium |
| **Total** | **15** | **Estimated: reports.js → 90%+, overall → 92%+** | **Mixed** |

### Projected Coverage After Implementation

| File | Current | Projected | Change |
|------|---------|-----------|--------|
| reports.js | 64.15% | ~92% | +28% |
| clients.js | 88.88% | ~96% | +7% |
| database/init.js | 85.71% | ~95% | +9% |
| **Overall** | **87.17%** | **~93%** | **+6%** |

### Classification Distribution of New TCs

| Classification | Count |
|---------------|-------|
| Core | 12 |
| Config | 8 |
| Repair-Direct | 3 |
| Chronic (inherited) | 7 (CSV/PDF export area) |
