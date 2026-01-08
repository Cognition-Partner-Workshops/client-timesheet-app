import { check, group } from 'k6';
import http from 'k6/http';
import { BASE_URL, getAuthHeaders, randomString } from './config.js';

let authToken = null;

export function login(email) {
  return group('Login', () => {
    const payload = JSON.stringify({ email });
    const response = http.post(`${BASE_URL}/api/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'Login' },
    });

    check(response, {
      'Login successful': (r) => r.status === 200,
      'Has token': (r) => {
        try {
          const body = JSON.parse(r.body);
          authToken = body.token;
          return !!body.token;
        } catch {
          return false;
        }
      },
    });

    return response;
  });
}

export function getToken() {
  return authToken;
}

export function getCurrentUser() {
  return group('Get Current User', () => {
    const response = http.get(`${BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(authToken),
      tags: { name: 'Get Current User' },
    });

    check(response, {
      'Get user successful': (r) => r.status === 200,
      'Has user data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return !!body.email;
        } catch {
          return false;
        }
      },
    });

    return response;
  });
}

export function getClients() {
  return group('Get Clients', () => {
    const response = http.get(`${BASE_URL}/api/clients`, {
      headers: getAuthHeaders(authToken),
      tags: { name: 'Get Clients' },
    });

    check(response, {
      'Get clients successful': (r) => r.status === 200,
      'Response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });

    return response;
  });
}

export function createClient() {
  return group('Create Client', () => {
    const payload = JSON.stringify({
      name: `Test Client ${randomString(6)}`,
      description: `Performance test client created at ${new Date().toISOString()}`,
    });

    const response = http.post(`${BASE_URL}/api/clients`, payload, {
      headers: getAuthHeaders(authToken),
      tags: { name: 'Create Client' },
    });

    check(response, {
      'Create client successful': (r) => r.status === 201,
      'Has client id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return !!body.id;
        } catch {
          return false;
        }
      },
    });

    return response;
  });
}

export function getWorkEntries() {
  return group('Get Work Entries', () => {
    const response = http.get(`${BASE_URL}/api/work-entries`, {
      headers: getAuthHeaders(authToken),
      tags: { name: 'Get Work Entries' },
    });

    check(response, {
      'Get work entries successful': (r) => r.status === 200,
      'Response is array': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body);
        } catch {
          return false;
        }
      },
    });

    return response;
  });
}

export function createWorkEntry(clientId) {
  return group('Create Work Entry', () => {
    const today = new Date().toISOString().split('T')[0];
    const payload = JSON.stringify({
      client_id: clientId,
      date: today,
      hours: Math.floor(Math.random() * 8) + 1,
      description: `Performance test work entry ${randomString(6)}`,
    });

    const response = http.post(`${BASE_URL}/api/work-entries`, payload, {
      headers: getAuthHeaders(authToken),
      tags: { name: 'Create Work Entry' },
    });

    check(response, {
      'Create work entry successful': (r) => r.status === 201,
      'Has entry id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return !!body.id;
        } catch {
          return false;
        }
      },
    });

    return response;
  });
}

export function getReport(clientId) {
  return group('Get Report', () => {
    const response = http.get(`${BASE_URL}/api/reports/client/${clientId}`, {
      headers: getAuthHeaders(authToken),
      tags: { name: 'Get Report' },
    });

    check(response, {
      'Get report successful': (r) => r.status === 200,
      'Has report data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.totalHours !== undefined;
        } catch {
          return false;
        }
      },
    });

    return response;
  });
}
