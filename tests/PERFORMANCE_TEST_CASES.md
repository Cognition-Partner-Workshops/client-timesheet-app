# Performance Test Cases - Client Timesheet Application

## Document Information
- **Application**: Client Timesheet Application
- **Version**: 1.0.0
- **Last Updated**: 2026-02-03
- **Author**: Devin AI

---

## 1. Performance Requirements

### 1.1 Response Time Requirements

| Endpoint Category | Target Response Time | Maximum Response Time |
|-------------------|---------------------|----------------------|
| Authentication (Login) | < 200ms | < 500ms |
| GET Operations (List) | < 300ms | < 1000ms |
| GET Operations (Single) | < 100ms | < 300ms |
| POST/PUT Operations | < 300ms | < 1000ms |
| DELETE Operations | < 200ms | < 500ms |
| Report Generation | < 500ms | < 2000ms |
| CSV Export | < 1000ms | < 3000ms |
| PDF Export | < 2000ms | < 5000ms |

### 1.2 Throughput Requirements

| Metric | Target | Maximum |
|--------|--------|---------|
| Concurrent Users | 50 | 100 |
| Requests per Second | 100 | 200 |
| Database Connections | 10 | 20 |

### 1.3 Resource Utilization Limits

| Resource | Warning Threshold | Critical Threshold |
|----------|------------------|-------------------|
| CPU Usage | 70% | 90% |
| Memory Usage | 70% | 85% |
| Disk I/O | 60% | 80% |

---

## 2. Load Test Cases

### TC-PERF-001: Baseline API Response Time
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-001 |
| **Requirement ID** | REQ-PERF-001 |
| **Priority** | High |
| **Test Type** | Load Test |
| **Objective** | Measure baseline response times for all API endpoints |
| **Test Configuration** | 1 virtual user, 100 iterations per endpoint |
| **Endpoints Tested** | POST /api/auth/login, GET /api/clients, GET /api/work-entries, GET /api/reports/client/:id |
| **Success Criteria** | All endpoints respond within target response times |
| **Metrics Collected** | Min, Max, Average, P95, P99 response times |

### TC-PERF-002: Concurrent User Load Test
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-002 |
| **Requirement ID** | REQ-PERF-002 |
| **Priority** | High |
| **Test Type** | Load Test |
| **Objective** | Verify system handles 50 concurrent users |
| **Test Configuration** | Ramp up: 0 to 50 users over 2 minutes, sustain for 5 minutes |
| **Workload Mix** | 40% GET clients, 30% GET work entries, 20% POST work entry, 10% GET reports |
| **Success Criteria** | Error rate < 1%, P95 response time < 1000ms |
| **Metrics Collected** | Throughput, error rate, response times, active users |

### TC-PERF-003: Peak Load Test
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-003 |
| **Requirement ID** | REQ-PERF-003 |
| **Priority** | High |
| **Test Type** | Load Test |
| **Objective** | Verify system handles peak load of 100 concurrent users |
| **Test Configuration** | Ramp up: 0 to 100 users over 5 minutes, sustain for 10 minutes |
| **Workload Mix** | 40% GET clients, 30% GET work entries, 20% POST work entry, 10% GET reports |
| **Success Criteria** | Error rate < 5%, P95 response time < 2000ms |
| **Metrics Collected** | Throughput, error rate, response times, resource utilization |

### TC-PERF-004: Stress Test
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-004 |
| **Requirement ID** | REQ-PERF-004 |
| **Priority** | Medium |
| **Test Type** | Stress Test |
| **Objective** | Identify system breaking point and recovery behavior |
| **Test Configuration** | Ramp up: 0 to 200 users over 10 minutes until failure |
| **Workload Mix** | Mixed CRUD operations |
| **Success Criteria** | System degrades gracefully, recovers after load reduction |
| **Metrics Collected** | Breaking point (users), recovery time, error types |

### TC-PERF-005: Endurance Test
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-005 |
| **Requirement ID** | REQ-PERF-005 |
| **Priority** | Medium |
| **Test Type** | Endurance Test |
| **Objective** | Verify system stability over extended period |
| **Test Configuration** | 30 concurrent users for 1 hour |
| **Workload Mix** | Realistic user behavior simulation |
| **Success Criteria** | No memory leaks, consistent response times, error rate < 0.1% |
| **Metrics Collected** | Memory usage over time, response time trends, error patterns |

---

## 3. API-Specific Performance Tests

### TC-PERF-006: Authentication Endpoint Performance
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-006 |
| **Requirement ID** | REQ-PERF-006 |
| **Priority** | High |
| **Test Type** | Load Test |
| **Objective** | Verify login endpoint handles burst of authentication requests |
| **Test Configuration** | 100 login requests in 10 seconds |
| **Success Criteria** | P95 < 500ms, no rate limiting errors for legitimate traffic |
| **Metrics Collected** | Response times, JWT generation time |

### TC-PERF-007: Client List Performance with Large Dataset
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-007 |
| **Requirement ID** | REQ-PERF-007 |
| **Priority** | Medium |
| **Test Type** | Load Test |
| **Objective** | Verify client list performance with 100+ clients |
| **Test Configuration** | Pre-populate 100 clients, 50 concurrent requests |
| **Success Criteria** | P95 < 500ms |
| **Metrics Collected** | Response times, payload size |

### TC-PERF-008: Work Entries List Performance with Large Dataset
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-008 |
| **Requirement ID** | REQ-PERF-008 |
| **Priority** | Medium |
| **Test Type** | Load Test |
| **Objective** | Verify work entries list performance with 1000+ entries |
| **Test Configuration** | Pre-populate 1000 work entries, 50 concurrent requests |
| **Success Criteria** | P95 < 1000ms |
| **Metrics Collected** | Response times, payload size, database query time |

### TC-PERF-009: Report Generation Performance
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-009 |
| **Requirement ID** | REQ-PERF-009 |
| **Priority** | High |
| **Test Type** | Load Test |
| **Objective** | Verify report generation with large work entry dataset |
| **Test Configuration** | Client with 500 work entries, 20 concurrent report requests |
| **Success Criteria** | P95 < 2000ms |
| **Metrics Collected** | Response times, aggregation time |

### TC-PERF-010: CSV Export Performance
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-010 |
| **Requirement ID** | REQ-PERF-010 |
| **Priority** | Medium |
| **Test Type** | Load Test |
| **Objective** | Verify CSV export performance with large dataset |
| **Test Configuration** | Client with 1000 work entries, 10 concurrent export requests |
| **Success Criteria** | P95 < 3000ms, file size < 1MB |
| **Metrics Collected** | Response times, file generation time, file size |

### TC-PERF-011: PDF Export Performance
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-011 |
| **Requirement ID** | REQ-PERF-011 |
| **Priority** | Medium |
| **Test Type** | Load Test |
| **Objective** | Verify PDF export performance with large dataset |
| **Test Configuration** | Client with 500 work entries, 5 concurrent export requests |
| **Success Criteria** | P95 < 5000ms, file size < 5MB |
| **Metrics Collected** | Response times, PDF generation time, file size |

---

## 4. Database Performance Tests

### TC-PERF-012: Database Query Performance
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-012 |
| **Requirement ID** | REQ-PERF-012 |
| **Priority** | High |
| **Test Type** | Database Test |
| **Objective** | Verify database query performance with indexes |
| **Test Configuration** | 10,000 work entries, measure query times |
| **Queries Tested** | SELECT by user_email, SELECT by client_id, SELECT by date range |
| **Success Criteria** | All queries < 100ms |
| **Metrics Collected** | Query execution time, index usage |

### TC-PERF-013: Database Write Performance
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-013 |
| **Requirement ID** | REQ-PERF-013 |
| **Priority** | Medium |
| **Test Type** | Database Test |
| **Objective** | Verify database write performance under load |
| **Test Configuration** | 100 concurrent INSERT operations |
| **Success Criteria** | P95 < 50ms per write |
| **Metrics Collected** | Write latency, lock contention |

### TC-PERF-014: Database Connection Pool Test
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-014 |
| **Requirement ID** | REQ-PERF-014 |
| **Priority** | Medium |
| **Test Type** | Database Test |
| **Objective** | Verify database handles connection exhaustion gracefully |
| **Test Configuration** | Exceed max connections, observe behavior |
| **Success Criteria** | Graceful queuing, no crashes, appropriate error messages |
| **Metrics Collected** | Connection wait time, error rate |

---

## 5. Frontend Performance Tests

### TC-PERF-015: Initial Page Load Time
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-015 |
| **Requirement ID** | REQ-PERF-015 |
| **Priority** | High |
| **Test Type** | Frontend Performance |
| **Objective** | Measure initial page load time |
| **Test Configuration** | Clear cache, measure from navigation to interactive |
| **Pages Tested** | Login, Dashboard, Clients, Work Entries, Reports |
| **Success Criteria** | Time to Interactive < 3 seconds |
| **Metrics Collected** | FCP, LCP, TTI, TBT |

### TC-PERF-016: Dashboard Data Loading
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-016 |
| **Requirement ID** | REQ-PERF-016 |
| **Priority** | Medium |
| **Test Type** | Frontend Performance |
| **Objective** | Measure dashboard data loading with React Query |
| **Test Configuration** | User with 50 clients, 500 work entries |
| **Success Criteria** | Data displayed within 2 seconds of page load |
| **Metrics Collected** | API call duration, render time |

### TC-PERF-017: Table Rendering Performance
| Field | Value |
|-------|-------|
| **Test Case ID** | TC-PERF-017 |
| **Requirement ID** | REQ-PERF-017 |
| **Priority** | Low |
| **Test Type** | Frontend Performance |
| **Objective** | Measure table rendering with large datasets |
| **Test Configuration** | 1000 rows in work entries table |
| **Success Criteria** | Smooth scrolling (60 FPS), no jank |
| **Metrics Collected** | Frame rate, memory usage |

---

## 6. k6 Load Test Scripts

### 6.1 Basic Load Test Script

```javascript
// File: tests/performance/k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const clientsDuration = new Trend('clients_duration');
const workEntriesDuration = new Trend('work_entries_duration');

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  // Login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, 
    JSON.stringify({ email: `user${__VU}@test.com` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(loginRes, { 'login successful': (r) => r.status === 200 });
  errorRate.add(loginRes.status !== 200);
  loginDuration.add(loginRes.timings.duration);
  
  const token = loginRes.json('token');
  const authHeaders = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };

  sleep(1);

  // Get clients
  const clientsRes = http.get(`${BASE_URL}/api/clients`, { headers: authHeaders });
  check(clientsRes, { 'get clients successful': (r) => r.status === 200 });
  errorRate.add(clientsRes.status !== 200);
  clientsDuration.add(clientsRes.timings.duration);

  sleep(1);

  // Get work entries
  const workEntriesRes = http.get(`${BASE_URL}/api/work-entries`, { headers: authHeaders });
  check(workEntriesRes, { 'get work entries successful': (r) => r.status === 200 });
  errorRate.add(workEntriesRes.status !== 200);
  workEntriesDuration.add(workEntriesRes.timings.duration);

  sleep(2);
}
```

### 6.2 Stress Test Script

```javascript
// File: tests/performance/k6/stress-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 100 },
    { duration: '5m', target: 150 },
    { duration: '5m', target: 200 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, 
    JSON.stringify({ email: `stress${__VU}@test.com` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    const authHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };

    // Mixed workload
    const rand = Math.random();
    if (rand < 0.4) {
      http.get(`${BASE_URL}/api/clients`, { headers: authHeaders });
    } else if (rand < 0.7) {
      http.get(`${BASE_URL}/api/work-entries`, { headers: authHeaders });
    } else if (rand < 0.9) {
      http.post(`${BASE_URL}/api/work-entries`, 
        JSON.stringify({
          clientId: 1,
          hours: 8,
          date: new Date().toISOString().split('T')[0],
          description: 'Load test entry'
        }),
        { headers: authHeaders }
      );
    } else {
      http.get(`${BASE_URL}/api/reports/client/1`, { headers: authHeaders });
    }
  }

  sleep(1);
}
```

### 6.3 Endurance Test Script

```javascript
// File: tests/performance/k6/endurance-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

export const options = {
  stages: [
    { duration: '5m', target: 30 },   // Ramp up
    { duration: '50m', target: 30 },  // Sustain for 50 minutes
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.001'],  // < 0.1% error rate
    http_req_duration: ['p(99)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function () {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, 
    JSON.stringify({ email: `endurance${__VU}@test.com` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (loginRes.status === 200) {
    successfulRequests.add(1);
    const token = loginRes.json('token');
    const authHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };

    // Simulate realistic user behavior
    http.get(`${BASE_URL}/api/clients`, { headers: authHeaders });
    sleep(2);
    
    http.get(`${BASE_URL}/api/work-entries`, { headers: authHeaders });
    sleep(3);
    
    // Occasionally create work entry
    if (Math.random() < 0.1) {
      http.post(`${BASE_URL}/api/work-entries`, 
        JSON.stringify({
          clientId: 1,
          hours: Math.floor(Math.random() * 8) + 1,
          date: new Date().toISOString().split('T')[0],
          description: 'Endurance test entry'
        }),
        { headers: authHeaders }
      );
    }
    
    sleep(5);
  } else {
    failedRequests.add(1);
  }
}
```

---

## 7. Performance Test Execution Guide

### 7.1 Prerequisites

1. Install k6: `brew install k6` (macOS) or download from https://k6.io
2. Ensure backend is running: `cd backend && npm run dev`
3. Ensure database has test data

### 7.2 Running Tests

```bash
# Basic load test
k6 run tests/performance/k6/load-test.js

# Stress test
k6 run tests/performance/k6/stress-test.js

# Endurance test (long running)
k6 run tests/performance/k6/endurance-test.js

# With custom base URL
k6 run -e BASE_URL=http://production-url:3001 tests/performance/k6/load-test.js

# Output to JSON for analysis
k6 run --out json=results.json tests/performance/k6/load-test.js
```

### 7.3 Analyzing Results

Key metrics to monitor:
- **http_req_duration**: Response time distribution
- **http_req_failed**: Error rate
- **iterations**: Throughput (requests per second)
- **vus**: Active virtual users

---

## 8. Requirements Traceability Matrix

| Requirement ID | Requirement Description | Test Case IDs | Status |
|----------------|------------------------|---------------|--------|
| REQ-PERF-001 | Baseline response times | TC-PERF-001 | Covered |
| REQ-PERF-002 | 50 concurrent users | TC-PERF-002 | Covered |
| REQ-PERF-003 | 100 concurrent users (peak) | TC-PERF-003 | Covered |
| REQ-PERF-004 | Graceful degradation | TC-PERF-004 | Covered |
| REQ-PERF-005 | Long-term stability | TC-PERF-005 | Covered |
| REQ-PERF-006 | Auth endpoint performance | TC-PERF-006 | Covered |
| REQ-PERF-007 | Client list scalability | TC-PERF-007 | Covered |
| REQ-PERF-008 | Work entries scalability | TC-PERF-008 | Covered |
| REQ-PERF-009 | Report generation speed | TC-PERF-009 | Covered |
| REQ-PERF-010 | CSV export performance | TC-PERF-010 | Covered |
| REQ-PERF-011 | PDF export performance | TC-PERF-011 | Covered |
| REQ-PERF-012 | Database query optimization | TC-PERF-012 | Covered |
| REQ-PERF-013 | Database write performance | TC-PERF-013 | Covered |
| REQ-PERF-014 | Connection pool handling | TC-PERF-014 | Covered |
| REQ-PERF-015 | Page load time | TC-PERF-015 | Covered |
| REQ-PERF-016 | Dashboard loading | TC-PERF-016 | Covered |
| REQ-PERF-017 | Table rendering | TC-PERF-017 | Covered |

---

## 9. Test Results Template

| Test Case ID | Date | Environment | Result | P95 Response Time | Error Rate | Notes |
|--------------|------|-------------|--------|-------------------|------------|-------|
| | | | | | | |
