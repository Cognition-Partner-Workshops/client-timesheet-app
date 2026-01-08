import { sleep } from 'k6';
import http from 'k6/http';
import { check, group } from 'k6';
import { THRESHOLDS, TEST_USER, getAuthHeaders, randomString, BASE_URL } from './config.js';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '3m', target: 200 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_failed: THRESHOLDS.HTTP_ERRORS,
    http_req_duration: THRESHOLDS.RESPONSE_TIME.LOAD.p95,
  },
};

// Setup runs once before all VUs start - login to create user
export function setup() {
  const payload = JSON.stringify({ email: TEST_USER.email });
  const response = http.post(`${BASE_URL}/api/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'Setup login successful': (r) => r.status === 200 || r.status === 201,
  });
  
  return { email: TEST_USER.email };
}

// Main test function - uses x-user-email header (no login needed per iteration)
export default function (data) {
  const headers = getAuthHeaders(data.email);
  const scenario = Math.random();

  if (scenario < 0.3) {
    group('Get Current User', () => {
      const response = http.get(`${BASE_URL}/api/auth/me`, { headers });
      check(response, { 'Get user successful': (r) => r.status === 200 });
    });
  } else if (scenario < 0.5) {
    group('Get Clients', () => {
      const response = http.get(`${BASE_URL}/api/clients`, { headers });
      check(response, { 'Get clients successful': (r) => r.status === 200 });
    });
  } else if (scenario < 0.7) {
    group('Get Work Entries', () => {
      const response = http.get(`${BASE_URL}/api/work-entries`, { headers });
      check(response, { 'Get work entries successful': (r) => r.status === 200 });
    });
  } else if (scenario < 0.85) {
    group('Create Client and Work Entry', () => {
      const clientPayload = JSON.stringify({
        name: `Test Client ${randomString(6)}`,
        description: `Performance test client`,
      });
      const clientResponse = http.post(`${BASE_URL}/api/clients`, clientPayload, { headers });
      check(clientResponse, { 'Create client successful': (r) => r.status === 201 });
      
      try {
        const client = JSON.parse(clientResponse.body);
        if (client.id) {
          const today = new Date().toISOString().split('T')[0];
          const entryPayload = JSON.stringify({
            client_id: client.id,
            date: today,
            hours: Math.floor(Math.random() * 8) + 1,
            description: `Performance test entry`,
          });
          const entryResponse = http.post(`${BASE_URL}/api/work-entries`, entryPayload, { headers });
          check(entryResponse, { 'Create work entry successful': (r) => r.status === 201 });
        }
      } catch (e) {
        // Ignore parse errors
      }
    });
  } else {
    group('Get Clients and Work Entries', () => {
      const clientsResponse = http.get(`${BASE_URL}/api/clients`, { headers });
      check(clientsResponse, { 'Get clients successful': (r) => r.status === 200 });
      
      const entriesResponse = http.get(`${BASE_URL}/api/work-entries`, { headers });
      check(entriesResponse, { 'Get work entries successful': (r) => r.status === 200 });
    });
  }

  sleep(0.1);
}
