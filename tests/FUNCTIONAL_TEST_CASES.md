# Functional Test Cases - Client Timesheet Application

## Document Information
- **Application**: Client Timesheet Application
- **Version**: 1.0.0
- **Last Updated**: 2026-02-03
- **Author**: Devin AI

---

## 1. Authentication Module

### TC-AUTH-001: Login with Valid Email
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-001 |
| **Requirement ID** | REQ-AUTH-001 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | Application is running, user is on login page |
| **Test Steps** | 1. Navigate to login page<br>2. Enter valid email (e.g., test@example.com)<br>3. Click "Log In" button |
| **Expected Result** | User is redirected to dashboard, email is displayed in header |
| **Postconditions** | User session is created, JWT token stored in localStorage |

### TC-AUTH-002: Login with Invalid Email Format
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-002 |
| **Requirement ID** | REQ-AUTH-001 |
| **Priority** | High |
| **Test Type** | Negative |
| **Preconditions** | Application is running, user is on login page |
| **Test Steps** | 1. Navigate to login page<br>2. Enter invalid email (e.g., "notanemail")<br>3. Click "Log In" button |
| **Expected Result** | Error message displayed, user remains on login page |
| **Postconditions** | No session created |

### TC-AUTH-003: Login with Empty Email
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-003 |
| **Requirement ID** | REQ-AUTH-001 |
| **Priority** | Medium |
| **Test Type** | Negative |
| **Preconditions** | Application is running, user is on login page |
| **Test Steps** | 1. Navigate to login page<br>2. Leave email field empty<br>3. Attempt to click "Log In" button |
| **Expected Result** | Login button is disabled, user cannot submit |
| **Postconditions** | No session created |

### TC-AUTH-004: Logout
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-004 |
| **Requirement ID** | REQ-AUTH-002 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in |
| **Test Steps** | 1. Click "Logout" button in header |
| **Expected Result** | User is redirected to login page, session is cleared |
| **Postconditions** | JWT token removed from localStorage |

### TC-AUTH-005: Session Persistence
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-AUTH-005 |
| **Requirement ID** | REQ-AUTH-003 |
| **Priority** | Medium |
| **Test Type** | Positive |
| **Preconditions** | User is logged in |
| **Test Steps** | 1. Refresh the browser page<br>2. Observe user state |
| **Expected Result** | User remains logged in, dashboard is displayed |
| **Postconditions** | Session maintained |

---

## 2. Client Management Module

### TC-CLIENT-001: View All Clients
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CLIENT-001 |
| **Requirement ID** | REQ-CLIENT-001 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, at least one client exists |
| **Test Steps** | 1. Navigate to Clients page |
| **Expected Result** | List of all user's clients displayed in table format |
| **Postconditions** | None |

### TC-CLIENT-002: Create New Client
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CLIENT-002 |
| **Requirement ID** | REQ-CLIENT-002 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, on Clients page |
| **Test Steps** | 1. Click "Add Client" button<br>2. Enter client name (e.g., "Acme Corp")<br>3. Enter description (optional)<br>4. Click "Save" |
| **Expected Result** | Client is created, appears in client list, success message shown |
| **Postconditions** | New client exists in database |

### TC-CLIENT-003: Create Client with Empty Name
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CLIENT-003 |
| **Requirement ID** | REQ-CLIENT-002 |
| **Priority** | Medium |
| **Test Type** | Negative |
| **Preconditions** | User is logged in, on Clients page |
| **Test Steps** | 1. Click "Add Client" button<br>2. Leave name field empty<br>3. Attempt to save |
| **Expected Result** | Validation error displayed, client not created |
| **Postconditions** | No new client in database |

### TC-CLIENT-004: Edit Existing Client
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CLIENT-004 |
| **Requirement ID** | REQ-CLIENT-003 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, client exists |
| **Test Steps** | 1. Navigate to Clients page<br>2. Click edit icon on a client row<br>3. Modify client name<br>4. Click "Save" |
| **Expected Result** | Client is updated, changes reflected in list |
| **Postconditions** | Client updated in database |

### TC-CLIENT-005: Delete Client
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CLIENT-005 |
| **Requirement ID** | REQ-CLIENT-004 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, client exists |
| **Test Steps** | 1. Navigate to Clients page<br>2. Click delete icon on a client row<br>3. Confirm deletion |
| **Expected Result** | Client is deleted, removed from list |
| **Postconditions** | Client and associated work entries removed from database |

### TC-CLIENT-006: Client Data Isolation
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-CLIENT-006 |
| **Requirement ID** | REQ-CLIENT-005 |
| **Priority** | Critical |
| **Test Type** | Security |
| **Preconditions** | Two users exist with different clients |
| **Test Steps** | 1. Login as User A<br>2. Note clients visible<br>3. Logout<br>4. Login as User B<br>5. Verify clients visible |
| **Expected Result** | Each user only sees their own clients |
| **Postconditions** | None |

---

## 3. Work Entry Module

### TC-WORK-001: View All Work Entries
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-WORK-001 |
| **Requirement ID** | REQ-WORK-001 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, work entries exist |
| **Test Steps** | 1. Navigate to Work Entries page |
| **Expected Result** | List of all work entries displayed with client name, hours, date, description |
| **Postconditions** | None |

### TC-WORK-002: Create Work Entry
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-WORK-002 |
| **Requirement ID** | REQ-WORK-002 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, at least one client exists |
| **Test Steps** | 1. Navigate to Work Entries page<br>2. Click "Add Work Entry"<br>3. Select client from dropdown<br>4. Enter hours (e.g., 8)<br>5. Select date<br>6. Enter description<br>7. Click "Save" |
| **Expected Result** | Work entry created, appears in list, dashboard totals updated |
| **Postconditions** | New work entry in database |

### TC-WORK-003: Create Work Entry with Invalid Hours
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-WORK-003 |
| **Requirement ID** | REQ-WORK-002 |
| **Priority** | Medium |
| **Test Type** | Negative |
| **Preconditions** | User is logged in, client exists |
| **Test Steps** | 1. Navigate to Work Entries page<br>2. Click "Add Work Entry"<br>3. Enter hours > 24 (e.g., 25)<br>4. Attempt to save |
| **Expected Result** | Validation error: hours must be between 0.01 and 24 |
| **Postconditions** | No work entry created |

### TC-WORK-004: Create Work Entry with Zero Hours
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-WORK-004 |
| **Requirement ID** | REQ-WORK-002 |
| **Priority** | Medium |
| **Test Type** | Negative |
| **Preconditions** | User is logged in, client exists |
| **Test Steps** | 1. Navigate to Work Entries page<br>2. Click "Add Work Entry"<br>3. Enter hours = 0<br>4. Attempt to save |
| **Expected Result** | Validation error: hours must be greater than 0 |
| **Postconditions** | No work entry created |

### TC-WORK-005: Edit Work Entry
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-WORK-005 |
| **Requirement ID** | REQ-WORK-003 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, work entry exists |
| **Test Steps** | 1. Navigate to Work Entries page<br>2. Click edit icon on a work entry<br>3. Modify hours<br>4. Click "Save" |
| **Expected Result** | Work entry updated, changes reflected in list and dashboard |
| **Postconditions** | Work entry updated in database |

### TC-WORK-006: Delete Work Entry
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-WORK-006 |
| **Requirement ID** | REQ-WORK-004 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, work entry exists |
| **Test Steps** | 1. Navigate to Work Entries page<br>2. Click delete icon on a work entry<br>3. Confirm deletion |
| **Expected Result** | Work entry deleted, removed from list, dashboard totals updated |
| **Postconditions** | Work entry removed from database |

### TC-WORK-007: Filter Work Entries by Client
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-WORK-007 |
| **Requirement ID** | REQ-WORK-005 |
| **Priority** | Medium |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, multiple clients with work entries exist |
| **Test Steps** | 1. Navigate to Work Entries page<br>2. Select a client from filter dropdown |
| **Expected Result** | Only work entries for selected client are displayed |
| **Postconditions** | None |

---

## 4. Dashboard Module

### TC-DASH-001: View Dashboard Statistics
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DASH-001 |
| **Requirement ID** | REQ-DASH-001 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in |
| **Test Steps** | 1. Navigate to Dashboard |
| **Expected Result** | Dashboard displays: Total Clients count, Total Work Entries count, Total Hours |
| **Postconditions** | None |

### TC-DASH-002: Dashboard Loading State
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DASH-002 |
| **Requirement ID** | REQ-DASH-002 |
| **Priority** | Medium |
| **Test Type** | Positive |
| **Preconditions** | User is logged in |
| **Test Steps** | 1. Navigate to Dashboard<br>2. Observe loading state |
| **Expected Result** | Loading spinner displayed while data is being fetched |
| **Postconditions** | None |

### TC-DASH-003: Dashboard Error State
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DASH-003 |
| **Requirement ID** | REQ-DASH-003 |
| **Priority** | Medium |
| **Test Type** | Negative |
| **Preconditions** | User is logged in, backend is unavailable |
| **Test Steps** | 1. Stop backend server<br>2. Navigate to Dashboard |
| **Expected Result** | Error message displayed: "Failed to load dashboard data" |
| **Postconditions** | None |

### TC-DASH-004: Recent Work Entries Display
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DASH-004 |
| **Requirement ID** | REQ-DASH-004 |
| **Priority** | Medium |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, work entries exist |
| **Test Steps** | 1. Navigate to Dashboard |
| **Expected Result** | Recent work entries (up to 5) displayed with client name, hours, date |
| **Postconditions** | None |

### TC-DASH-005: Quick Actions Navigation
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-DASH-005 |
| **Requirement ID** | REQ-DASH-005 |
| **Priority** | Low |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, on Dashboard |
| **Test Steps** | 1. Click "Add Client" quick action<br>2. Verify navigation<br>3. Return to Dashboard<br>4. Click "Add Work Entry"<br>5. Verify navigation |
| **Expected Result** | Each quick action navigates to correct page |
| **Postconditions** | None |

---

## 5. Reports Module

### TC-REPORT-001: View Client Report
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-REPORT-001 |
| **Requirement ID** | REQ-REPORT-001 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, client with work entries exists |
| **Test Steps** | 1. Navigate to Reports page<br>2. Select a client from dropdown |
| **Expected Result** | Report displays: client name, list of work entries, total hours |
| **Postconditions** | None |

### TC-REPORT-002: Export Report as CSV
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-REPORT-002 |
| **Requirement ID** | REQ-REPORT-002 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, client report is displayed |
| **Test Steps** | 1. View client report<br>2. Click "Export CSV" button |
| **Expected Result** | CSV file downloaded with work entry data |
| **Postconditions** | File saved to user's downloads |

### TC-REPORT-003: Export Report as PDF
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-REPORT-003 |
| **Requirement ID** | REQ-REPORT-003 |
| **Priority** | High |
| **Test Type** | Positive |
| **Preconditions** | User is logged in, client report is displayed |
| **Test Steps** | 1. View client report<br>2. Click "Export PDF" button |
| **Expected Result** | PDF file downloaded with formatted report |
| **Postconditions** | File saved to user's downloads |

### TC-REPORT-004: Report with No Work Entries
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-REPORT-004 |
| **Requirement ID** | REQ-REPORT-001 |
| **Priority** | Medium |
| **Test Type** | Boundary |
| **Preconditions** | User is logged in, client exists with no work entries |
| **Test Steps** | 1. Navigate to Reports page<br>2. Select client with no work entries |
| **Expected Result** | Report displays client name, "No work entries" message, 0 total hours |
| **Postconditions** | None |

---

## 6. Navigation & UI Module

### TC-NAV-001: Sidebar Navigation
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-NAV-001 |
| **Requirement ID** | REQ-NAV-001 |
| **Priority** | Medium |
| **Test Type** | Positive |
| **Preconditions** | User is logged in |
| **Test Steps** | 1. Click Dashboard in sidebar<br>2. Click Clients in sidebar<br>3. Click Work Entries in sidebar<br>4. Click Reports in sidebar |
| **Expected Result** | Each click navigates to correct page, active item highlighted |
| **Postconditions** | None |

### TC-NAV-002: Protected Routes
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-NAV-002 |
| **Requirement ID** | REQ-NAV-002 |
| **Priority** | High |
| **Test Type** | Security |
| **Preconditions** | User is not logged in |
| **Test Steps** | 1. Directly navigate to /dashboard URL |
| **Expected Result** | User is redirected to login page |
| **Postconditions** | None |

### TC-NAV-003: Responsive Layout
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-NAV-003 |
| **Requirement ID** | REQ-NAV-003 |
| **Priority** | Low |
| **Test Type** | Positive |
| **Preconditions** | User is logged in |
| **Test Steps** | 1. Resize browser to mobile width<br>2. Verify layout adjusts |
| **Expected Result** | Layout adapts to screen size, all elements accessible |
| **Postconditions** | None |

---

## Requirements Traceability Matrix

| Requirement ID | Requirement Description | Test Case IDs | Status |
|----------------|------------------------|---------------|--------|
| REQ-AUTH-001 | User can login with email | TC-AUTH-001, TC-AUTH-002, TC-AUTH-003 | Covered |
| REQ-AUTH-002 | User can logout | TC-AUTH-004 | Covered |
| REQ-AUTH-003 | Session persists on refresh | TC-AUTH-005 | Covered |
| REQ-CLIENT-001 | View all clients | TC-CLIENT-001 | Covered |
| REQ-CLIENT-002 | Create new client | TC-CLIENT-002, TC-CLIENT-003 | Covered |
| REQ-CLIENT-003 | Edit existing client | TC-CLIENT-004 | Covered |
| REQ-CLIENT-004 | Delete client | TC-CLIENT-005 | Covered |
| REQ-CLIENT-005 | Client data isolation | TC-CLIENT-006 | Covered |
| REQ-WORK-001 | View all work entries | TC-WORK-001 | Covered |
| REQ-WORK-002 | Create work entry | TC-WORK-002, TC-WORK-003, TC-WORK-004 | Covered |
| REQ-WORK-003 | Edit work entry | TC-WORK-005 | Covered |
| REQ-WORK-004 | Delete work entry | TC-WORK-006 | Covered |
| REQ-WORK-005 | Filter work entries | TC-WORK-007 | Covered |
| REQ-DASH-001 | View dashboard statistics | TC-DASH-001 | Covered |
| REQ-DASH-002 | Dashboard loading state | TC-DASH-002 | Covered |
| REQ-DASH-003 | Dashboard error handling | TC-DASH-003 | Covered |
| REQ-DASH-004 | Recent work entries | TC-DASH-004 | Covered |
| REQ-DASH-005 | Quick actions | TC-DASH-005 | Covered |
| REQ-REPORT-001 | View client report | TC-REPORT-001, TC-REPORT-004 | Covered |
| REQ-REPORT-002 | Export CSV | TC-REPORT-002 | Covered |
| REQ-REPORT-003 | Export PDF | TC-REPORT-003 | Covered |
| REQ-NAV-001 | Sidebar navigation | TC-NAV-001 | Covered |
| REQ-NAV-002 | Protected routes | TC-NAV-002 | Covered |
| REQ-NAV-003 | Responsive layout | TC-NAV-003 | Covered |

---

## Test Execution Summary Template

| Date | Tester | Environment | Total Tests | Passed | Failed | Blocked | Pass Rate |
|------|--------|-------------|-------------|--------|--------|---------|-----------|
| | | | 30 | | | | |

---

## Defect Log Template

| Defect ID | Test Case | Severity | Description | Status | Resolution |
|-----------|-----------|----------|-------------|--------|------------|
| | | | | | |
