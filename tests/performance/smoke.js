import { sleep } from 'k6';
import { THRESHOLDS, TEST_USER } from './config.js';
import { login, getCurrentUser, getClients, getWorkEntries } from './helpers.js';

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_failed: THRESHOLDS.HTTP_ERRORS,
    http_req_duration: THRESHOLDS.RESPONSE_TIME.SMOKE.p95,
  },
};

export function setup() {
  login(TEST_USER.email);
}

export default function () {
  login(TEST_USER.email);
  sleep(0.5);

  getCurrentUser();
  sleep(0.5);

  getClients();
  sleep(0.5);

  getWorkEntries();
  sleep(0.5);
}
