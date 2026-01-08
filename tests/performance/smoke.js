import { sleep } from 'k6';
import { THRESHOLDS, TEST_USER, getAuthHeaders } from './config.js';
import http from 'k6/http';
import { check, group } from 'k6';
import { BASE_URL } from './config.js';

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_failed: THRESHOLDS.HTTP_ERRORS,
    http_req_duration: THRESHOLDS.RESPONSE_TIME.SMOKE.p95,
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
  
  // Get current user
  group('Get Current User', () => {
    const response = http.get(`${BASE_URL}/api/auth/me`, { headers });
    check(response, {
      'Get user successful': (r) => r.status === 200,
    });
  });
  sleep(0.5);

  // Get clients
  group('Get Clients', () => {
    const response = http.get(`${BASE_URL}/api/clients`, { headers });
    check(response, {
      'Get clients successful': (r) => r.status === 200,
    });
  });
  sleep(0.5);

  // Get work entries
  group('Get Work Entries', () => {
    const response = http.get(`${BASE_URL}/api/work-entries`, { headers });
    check(response, {
      'Get work entries successful': (r) => r.status === 200,
    });
  });
  sleep(0.5);
}
