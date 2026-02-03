/**
 * k6 Stress Test Script - Client Timesheet Application
 * 
 * Test Case: TC-PERF-004 - Stress Test
 * Requirement: REQ-PERF-004 - Identify system breaking point
 * 
 * Usage: k6 run tests/performance/k6/stress-test.js
 * With custom URL: k6 run -e BASE_URL=http://localhost:3001 tests/performance/k6/stress-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successfulRequests = new Counter('successful_requests');
const failedRequests = new Counter('failed_requests');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Increase to 100 users
    { duration: '5m', target: 150 },  // Increase to 150 users
    { duration: '5m', target: 200 },  // Push to 200 users (stress point)
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],      // Allow up to 10% failure rate
    http_req_duration: ['p(95)<3000'],   // 95% under 3 seconds
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export function setup() {
  console.log(`Running stress test against: ${BASE_URL}`);
  return { baseUrl: BASE_URL };
}

export default function (data) {
  const userEmail = `stresstest-user${__VU}@example.com`;
  
  // Login
  const loginRes = http.post(`${data.baseUrl}/api/auth/login`, 
    JSON.stringify({ email: userEmail }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  if (loginRes.status !== 200) {
    errorRate.add(true);
    failedRequests.add(1);
    return;
  }
  
  successfulRequests.add(1);
  const token = loginRes.json('token');
  const authHeaders = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };

  // Mixed workload simulation
  const rand = Math.random();
  
  if (rand < 0.4) {
    // 40% - Get clients
    const res = http.get(`${data.baseUrl}/api/clients`, { headers: authHeaders });
    const success = check(res, { 'get clients ok': (r) => r.status === 200 });
    errorRate.add(!success);
    if (success) successfulRequests.add(1);
    else failedRequests.add(1);
    
  } else if (rand < 0.7) {
    // 30% - Get work entries
    const res = http.get(`${data.baseUrl}/api/work-entries`, { headers: authHeaders });
    const success = check(res, { 'get work entries ok': (r) => r.status === 200 });
    errorRate.add(!success);
    if (success) successfulRequests.add(1);
    else failedRequests.add(1);
    
  } else if (rand < 0.9) {
    // 20% - Create work entry (requires existing client)
    const clientsRes = http.get(`${data.baseUrl}/api/clients`, { headers: authHeaders });
    const clients = clientsRes.json('clients') || [];
    
    if (clients.length > 0) {
      const res = http.post(`${data.baseUrl}/api/work-entries`, 
        JSON.stringify({
          clientId: clients[0].id,
          hours: Math.floor(Math.random() * 8) + 1,
          date: new Date().toISOString().split('T')[0],
          description: `Stress test entry - VU ${__VU}`
        }),
        { headers: authHeaders }
      );
      const success = check(res, { 'create work entry ok': (r) => r.status === 201 });
      errorRate.add(!success);
      if (success) successfulRequests.add(1);
      else failedRequests.add(1);
    }
    
  } else {
    // 10% - Get report
    const clientsRes = http.get(`${data.baseUrl}/api/clients`, { headers: authHeaders });
    const clients = clientsRes.json('clients') || [];
    
    if (clients.length > 0) {
      const res = http.get(`${data.baseUrl}/api/reports/client/${clients[0].id}`, { headers: authHeaders });
      const success = check(res, { 'get report ok': (r) => r.status === 200 });
      errorRate.add(!success);
      if (success) successfulRequests.add(1);
      else failedRequests.add(1);
    }
  }

  sleep(1);
}

export function teardown(data) {
  console.log('Stress test completed');
}
