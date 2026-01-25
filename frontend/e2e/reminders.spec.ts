import { test, expect } from '@playwright/test';

test.describe('Reminder API Endpoints', () => {
  const baseURL = 'http://localhost:3001';

  test.describe('GET /api/reminders/missed', () => {
    test('should return users with missed timesheets with default lookbackDays', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/reminders/missed`);
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      expect(data).toHaveProperty('lookbackDays', 7);
      expect(data).toHaveProperty('totalUsers');
      expect(data).toHaveProperty('users');
      expect(Array.isArray(data.users)).toBeTruthy();
    });

    test('should accept custom lookbackDays parameter', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/reminders/missed?lookbackDays=14`);
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      expect(data.lookbackDays).toBe(14);
    });

    test('should return 400 for lookbackDays less than 1', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/reminders/missed?lookbackDays=0`);
      
      expect(response.status()).toBe(400);
      const data = await response.json();
      
      expect(data.error).toBe('lookbackDays must be between 1 and 30');
    });

    test('should return 400 for lookbackDays greater than 30', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/reminders/missed?lookbackDays=31`);
      
      expect(response.status()).toBe(400);
      const data = await response.json();
      
      expect(data.error).toBe('lookbackDays must be between 1 and 30');
    });

    test('should return 400 for invalid lookbackDays (non-numeric)', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/reminders/missed?lookbackDays=invalid`);
      
      expect(response.status()).toBe(400);
      const data = await response.json();
      
      expect(data.error).toBe('lookbackDays must be between 1 and 30');
    });

    test('should return users with missedDates array', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/reminders/missed?lookbackDays=7`);
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      if (data.users.length > 0) {
        const user = data.users[0];
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('missedDates');
        expect(Array.isArray(user.missedDates)).toBeTruthy();
      }
    });
  });

  test.describe('POST /api/reminders/check', () => {
    test('should trigger reminder check with default lookbackDays', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/reminders/check`, {
        data: {}
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      expect(data.message).toBe('Reminder check completed');
      expect(data.lookbackDays).toBe(7);
      expect(data).toHaveProperty('totalUsers');
      expect(data).toHaveProperty('emailsSent');
      expect(data).toHaveProperty('emailsFailed');
      expect(data).toHaveProperty('details');
    });

    test('should accept custom lookbackDays in request body', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/reminders/check`, {
        data: { lookbackDays: 14 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      expect(data.lookbackDays).toBe(14);
    });

    test('should return 400 for lookbackDays less than 1', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/reminders/check`, {
        data: { lookbackDays: 0 }
      });
      
      expect(response.status()).toBe(400);
    });

    test('should return 400 for lookbackDays greater than 30', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/reminders/check`, {
        data: { lookbackDays: 50 }
      });
      
      expect(response.status()).toBe(400);
    });

    test('should return details array with email status', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/reminders/check`, {
        data: { lookbackDays: 7 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      expect(Array.isArray(data.details)).toBeTruthy();
      
      if (data.details.length > 0) {
        const detail = data.details[0];
        expect(detail).toHaveProperty('email');
        expect(detail).toHaveProperty('missedDates');
        expect(detail).toHaveProperty('status');
        expect(['sent', 'failed']).toContain(detail.status);
      }
    });

    test('should handle email failures gracefully', async ({ request }) => {
      const response = await request.post(`${baseURL}/api/reminders/check`, {
        data: { lookbackDays: 7 }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      expect(typeof data.emailsSent).toBe('number');
      expect(typeof data.emailsFailed).toBe('number');
      expect(data.emailsSent + data.emailsFailed).toBe(data.totalUsers);
    });
  });

  test.describe('Integration Tests', () => {
    test('should detect newly created user with no timesheets', async ({ request }) => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      await request.post(`${baseURL}/api/auth/login`, {
        data: { email: uniqueEmail }
      });

      const response = await request.get(`${baseURL}/api/reminders/missed?lookbackDays=7`);
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      const newUser = data.users.find((u: { email: string }) => u.email === uniqueEmail);
      expect(newUser).toBeDefined();
      expect(newUser.missedDates.length).toBeGreaterThan(0);
    });

    test('should exclude weekends from missed dates', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/reminders/missed?lookbackDays=14`);
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      
      if (data.users.length > 0) {
        const user = data.users[0];
        for (const dateStr of user.missedDates) {
          const date = new Date(dateStr);
          const dayOfWeek = date.getUTCDay();
          expect(dayOfWeek).not.toBe(0);
          expect(dayOfWeek).not.toBe(6);
        }
      }
    });

    test('should create work entry and verify API response structure', async ({ request }) => {
      const uniqueEmail = `test-with-entry-${Date.now()}@example.com`;
      
      await request.post(`${baseURL}/api/auth/login`, {
        data: { email: uniqueEmail }
      });

      const clientResponse = await request.post(`${baseURL}/api/clients`, {
        headers: { 'x-user-email': uniqueEmail },
        data: { name: 'Test Client', description: 'Test' }
      });
      expect(clientResponse.ok()).toBeTruthy();
      const clientData = await clientResponse.json();
      const clientId = clientData.client.id;

      const dateStr = '2026-01-06';

      const entryResponse = await request.post(`${baseURL}/api/work-entries`, {
        headers: { 'x-user-email': uniqueEmail },
        data: {
          clientId: clientId,
          hours: 8,
          description: 'Test work',
          date: dateStr
        }
      });
      expect(entryResponse.ok()).toBeTruthy();
      const entryData = await entryResponse.json();
      expect(entryData.workEntry).toBeDefined();
      expect(entryData.workEntry.hours).toBe(8);
      expect(entryData.workEntry.client_id).toBe(clientId);

      const workEntriesResponse = await request.get(`${baseURL}/api/work-entries`, {
        headers: { 'x-user-email': uniqueEmail }
      });
      expect(workEntriesResponse.ok()).toBeTruthy();
      const workEntriesData = await workEntriesResponse.json();
      
      expect(workEntriesData.workEntries.length).toBeGreaterThan(0);
    });
  });
});
