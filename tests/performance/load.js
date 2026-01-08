import { sleep } from 'k6';
import { THRESHOLDS, TEST_USER } from './config.js';
import { login, getCurrentUser, getClients, getWorkEntries, createClient, createWorkEntry } from './helpers.js';

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

export default function () {
  login(TEST_USER.email);

  const scenario = Math.random();

  if (scenario < 0.3) {
    getCurrentUser();
  } else if (scenario < 0.5) {
    getClients();
  } else if (scenario < 0.7) {
    getWorkEntries();
  } else if (scenario < 0.85) {
    const clientResponse = createClient();
    try {
      const client = JSON.parse(clientResponse.body);
      if (client.id) {
        createWorkEntry(client.id);
      }
    } catch (e) {
      // Ignore parse errors
    }
  } else {
    getClients();
    getWorkEntries();
  }

  sleep(0.1);
}
