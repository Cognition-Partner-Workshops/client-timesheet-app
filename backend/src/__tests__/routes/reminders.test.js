const request = require('supertest');
const express = require('express');
const reminderRoutes = require('../../routes/reminders');
const { getUsersWithMissedTimesheets, sendReminders } = require('../../services/reminderService');

jest.mock('../../services/reminderService');

const app = express();
app.use(express.json());
app.use('/api/reminders', reminderRoutes);
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ error: 'Validation error' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

describe('Reminder Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reminders/missed', () => {
    test('should return users with missed timesheets', async () => {
      const mockUsers = [
        { email: 'user1@example.com', missedDates: ['2024-01-15', '2024-01-16'] },
        { email: 'user2@example.com', missedDates: ['2024-01-15'] }
      ];

      getUsersWithMissedTimesheets.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/reminders/missed')
        .query({ lookbackDays: 7 });

      expect(response.status).toBe(200);
      expect(response.body.lookbackDays).toBe(7);
      expect(response.body.totalUsers).toBe(2);
      expect(response.body.users).toEqual(mockUsers);
    });

    test('should use default lookbackDays when not provided', async () => {
      getUsersWithMissedTimesheets.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/reminders/missed');

      expect(response.status).toBe(200);
      expect(response.body.lookbackDays).toBe(7);
      expect(getUsersWithMissedTimesheets).toHaveBeenCalledWith(7);
    });

    test('should return 400 for invalid lookbackDays (too low)', async () => {
      const response = await request(app)
        .get('/api/reminders/missed')
        .query({ lookbackDays: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('lookbackDays must be between 1 and 30');
    });

    test('should return 400 for invalid lookbackDays (too high)', async () => {
      const response = await request(app)
        .get('/api/reminders/missed')
        .query({ lookbackDays: 31 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('lookbackDays must be between 1 and 30');
    });

    test('should handle service errors', async () => {
      getUsersWithMissedTimesheets.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/reminders/missed');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('POST /api/reminders/check', () => {
    test('should send reminders and return results', async () => {
      const mockResults = {
        totalUsers: 2,
        emailsSent: 2,
        emailsFailed: 0,
        details: [
          { email: 'user1@example.com', missedDates: ['2024-01-15'], status: 'sent', messageId: 'msg-1' },
          { email: 'user2@example.com', missedDates: ['2024-01-16'], status: 'sent', messageId: 'msg-2' }
        ]
      };

      sendReminders.mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/reminders/check')
        .send({ lookbackDays: 7 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reminder check completed');
      expect(response.body.lookbackDays).toBe(7);
      expect(response.body.totalUsers).toBe(2);
      expect(response.body.emailsSent).toBe(2);
      expect(response.body.emailsFailed).toBe(0);
    });

    test('should use default lookbackDays when not provided', async () => {
      sendReminders.mockResolvedValue({
        totalUsers: 0,
        emailsSent: 0,
        emailsFailed: 0,
        details: []
      });

      const response = await request(app)
        .post('/api/reminders/check')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.lookbackDays).toBe(7);
      expect(sendReminders).toHaveBeenCalledWith(7);
    });

    test('should accept custom lookbackDays', async () => {
      sendReminders.mockResolvedValue({
        totalUsers: 0,
        emailsSent: 0,
        emailsFailed: 0,
        details: []
      });

      const response = await request(app)
        .post('/api/reminders/check')
        .send({ lookbackDays: 14 });

      expect(response.status).toBe(200);
      expect(response.body.lookbackDays).toBe(14);
      expect(sendReminders).toHaveBeenCalledWith(14);
    });

    test('should return 400 for invalid lookbackDays', async () => {
      const response = await request(app)
        .post('/api/reminders/check')
        .send({ lookbackDays: 50 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    test('should handle service errors', async () => {
      sendReminders.mockRejectedValue(new Error('Email service unavailable'));

      const response = await request(app)
        .post('/api/reminders/check')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });

    test('should report partial failures', async () => {
      const mockResults = {
        totalUsers: 2,
        emailsSent: 1,
        emailsFailed: 1,
        details: [
          { email: 'user1@example.com', missedDates: ['2024-01-15'], status: 'sent', messageId: 'msg-1' },
          { email: 'user2@example.com', missedDates: ['2024-01-16'], status: 'failed', error: 'Invalid email' }
        ]
      };

      sendReminders.mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/reminders/check')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.emailsSent).toBe(1);
      expect(response.body.emailsFailed).toBe(1);
    });
  });
});
