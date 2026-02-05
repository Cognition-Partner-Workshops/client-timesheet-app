export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const THRESHOLDS = {
  HTTP_ERRORS: ['rate<0.10'], // Allow up to 10% errors for CI
  RESPONSE_TIME: {
    SMOKE: {
      p95: ['p(95)<500'],
      p99: ['p(99)<1000'],
    },
    LOAD: {
      p95: ['p(95)<1000'],
      p99: ['p(99)<2000'],
    },
    STRESS: {
      p95: ['p(95)<2000'],
      p99: ['p(99)<4000'],
    },
  },
};

export const TEST_USER = {
  email: __ENV.TEST_USER_EMAIL || 'test@example.com',
};

export function getAuthHeaders(email) {
  return {
    'Content-Type': 'application/json',
    'x-user-email': email,
  };
}

export function randomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
