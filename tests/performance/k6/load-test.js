/**
 * k6 Load Test Script - Client Timesheet Application
 * 
 * Test Case: TC-PERF-002 - Concurrent User Load Test
 * Requirement: REQ-PERF-002 - System handles 50 concurrent users
 * 
 * Usage: k6 run tests/performance/k6/load-test.js
 * With custom URL: k6 run -e BASE_URL=http://localhost:3001 tests/performance/k6/load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics for detailed analysis
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const clientsDuration = new Trend('clients_duration');
const workEntriesDuration = new Trend('work_entries_duration');
const reportsDuration = new Trend('reports_duration');

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users over 2 minutes
    { duration: '5m', target: 50 },  // Stay at 50 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% of requests under 1s
    errors: ['rate<0.01'],               // Error rate under 1%
    login_duration: ['p(95)<500'],       // Login under 500ms
    clients_duration: ['p(95)<500'],     // Get clients under 500ms
    work_entries_duration: ['p(95)<500'], // Get work entries under 500ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export function setup() {
  console.log(`Running load test against: ${BASE_URL}`);
  
  // Verify server is reachable
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`Server health check failed: ${healthCheck.status}`);
  }
  
  return { baseUrl: BASE_URL };
}

export default function (data) {
  const userEmail = `loadtest-user${__VU}@example.com`;
  
  // Step 1: Login
  const loginPayload = JSON.stringify({ email: userEmail });
  const loginRes = http.post(`${data.baseUrl}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });
  
  const loginSuccess = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login returns token': (r) => r.json('token') !== undefined,
  });
  
  errorRate.add(!loginSuccess);
  loginDuration.add(loginRes.timings.duration);
  
  if (!loginSuccess) {
    console.error(`Login failed for ${userEmail}: ${loginRes.status}`);
    return;
  }
  
  const token = loginRes.json('token');
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  
  sleep(1);
  
  // Step 2: Get clients (40% of workload)
  const clientsRes = http.get(`${data.baseUrl}/api/clients`, {
    headers: authHeaders,
    tags: { name: 'get_clients' },
  });
  
  const clientsSuccess = check(clientsRes, {
    'get clients status is 200': (r) => r.status === 200,
  });
  
  errorRate.add(!clientsSuccess);
  clientsDuration.add(clientsRes.timings.duration);
  
  sleep(1);
  
  // Step 3: Get work entries (30% of workload)
  const workEntriesRes = http.get(`${data.baseUrl}/api/work-entries`, {
    headers: authHeaders,
    tags: { name: 'get_work_entries' },
  });
  
  const workEntriesSuccess = check(workEntriesRes, {
    'get work entries status is 200': (r) => r.status === 200,
  });
  
  errorRate.add(!workEntriesSuccess);
  workEntriesDuration.add(workEntriesRes.timings.duration);
  
  sleep(1);
  
  // Step 4: Create a work entry (20% of workload - simulated by random)
  if (Math.random() < 0.2) {
    const clients = clientsRes.json('clients') || [];
    if (clients.length > 0) {
      const clientId = clients[0].id;
      const workEntryPayload = JSON.stringify({
        clientId: clientId,
        hours: Math.floor(Math.random() * 8) + 1,
        date: new Date().toISOString().split('T')[0],
        description: `Load test work entry - VU ${__VU}`,
      });
      
      const createRes = http.post(`${data.baseUrl}/api/work-entries`, workEntryPayload, {
        headers: authHeaders,
        tags: { name: 'create_work_entry' },
      });
      
      check(createRes, {
        'create work entry status is 201': (r) => r.status === 201,
      });
    }
  }
  
  sleep(1);
  
  // Step 5: Get report (10% of workload - simulated by random)
  if (Math.random() < 0.1) {
    const clients = clientsRes.json('clients') || [];
    if (clients.length > 0) {
      const clientId = clients[0].id;
      const reportRes = http.get(`${data.baseUrl}/api/reports/client/${clientId}`, {
        headers: authHeaders,
        tags: { name: 'get_report' },
      });
      
      const reportSuccess = check(reportRes, {
        'get report status is 200': (r) => r.status === 200,
      });
      
      errorRate.add(!reportSuccess);
      reportsDuration.add(reportRes.timings.duration);
    }
  }
  
  sleep(2);
}

export function teardown(data) {
  console.log('Load test completed');
}
