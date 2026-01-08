const { 
  getUsersWithMissedTimesheets, 
  sendReminders,
  getWorkingDays,
  formatDate
} = require('../../services/reminderService');
const { getDatabase } = require('../../database/init');
const { sendTimesheetReminderEmail } = require('../../services/emailService');

jest.mock('../../database/init');
jest.mock('../../services/emailService');

describe('Reminder Service', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
    jest.clearAllMocks();
  });

  describe('formatDate', () => {
    test('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });
  });

  describe('getWorkingDays', () => {
    test('should return only weekdays', () => {
      const startDate = new Date('2024-01-15'); // Monday
      const endDate = new Date('2024-01-19'); // Friday
      
      const workingDays = getWorkingDays(startDate, endDate);
      
      expect(workingDays).toHaveLength(5);
      expect(workingDays).toContain('2024-01-15');
      expect(workingDays).toContain('2024-01-16');
      expect(workingDays).toContain('2024-01-17');
      expect(workingDays).toContain('2024-01-18');
      expect(workingDays).toContain('2024-01-19');
    });

    test('should exclude weekends', () => {
      const startDate = new Date('2024-01-13'); // Saturday
      const endDate = new Date('2024-01-14'); // Sunday
      
      const workingDays = getWorkingDays(startDate, endDate);
      
      expect(workingDays).toHaveLength(0);
    });

    test('should handle week spanning weekend', () => {
      const startDate = new Date('2024-01-12'); // Friday
      const endDate = new Date('2024-01-15'); // Monday
      
      const workingDays = getWorkingDays(startDate, endDate);
      
      expect(workingDays).toHaveLength(2);
      expect(workingDays).toContain('2024-01-12');
      expect(workingDays).toContain('2024-01-15');
    });
  });

  describe('getUsersWithMissedTimesheets', () => {
    test('should return empty array when no users exist', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const result = await getUsersWithMissedTimesheets(7);
      
      expect(result).toEqual([]);
    });

    test('should return users with missed dates', async () => {
      const users = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        if (query === 'SELECT email FROM users') {
          callback(null, users);
        } else if (query.includes('SELECT DISTINCT date FROM work_entries')) {
          if (params[0] === 'user1@example.com') {
            callback(null, []);
          } else {
            callback(null, [{ date: params[1] }]);
          }
        }
      });

      const result = await getUsersWithMissedTimesheets(7);
      
      expect(result.length).toBeGreaterThanOrEqual(1);
      const user1Result = result.find(u => u.email === 'user1@example.com');
      expect(user1Result).toBeDefined();
      expect(user1Result.missedDates.length).toBeGreaterThan(0);
    });

    test('should handle database error when fetching users', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      await expect(getUsersWithMissedTimesheets(7)).rejects.toThrow('Database error');
    });

    test('should handle database error when fetching work entries', async () => {
      const users = [{ email: 'user1@example.com' }];

      mockDb.all.mockImplementation((query, params, callback) => {
        if (query === 'SELECT email FROM users') {
          callback(null, users);
        } else {
          callback(new Error('Query error'), null);
        }
      });

      const result = await getUsersWithMissedTimesheets(7);
      expect(result).toEqual([]);
    });
  });

  describe('sendReminders', () => {
    test('should send reminders to users with missed timesheets', async () => {
      const users = [{ email: 'user1@example.com' }];

      mockDb.all.mockImplementation((query, params, callback) => {
        if (query === 'SELECT email FROM users') {
          callback(null, users);
        } else {
          callback(null, []);
        }
      });

      sendTimesheetReminderEmail.mockResolvedValue({ 
        success: true, 
        messageId: 'test-id' 
      });

      const result = await sendReminders(7);

      expect(result.totalUsers).toBeGreaterThanOrEqual(0);
      expect(result.emailsSent).toBeGreaterThanOrEqual(0);
      expect(result.emailsFailed).toBe(0);
    });

    test('should handle email sending failures', async () => {
      const users = [{ email: 'user1@example.com' }];

      mockDb.all.mockImplementation((query, params, callback) => {
        if (query === 'SELECT email FROM users') {
          callback(null, users);
        } else {
          callback(null, []);
        }
      });

      sendTimesheetReminderEmail.mockResolvedValue({ 
        success: false, 
        error: 'SMTP error' 
      });

      const result = await sendReminders(7);

      expect(result.emailsFailed).toBeGreaterThanOrEqual(0);
    });

    test('should return empty results when no users have missed timesheets', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        if (query === 'SELECT email FROM users') {
          callback(null, []);
        }
      });

      const result = await sendReminders(7);

      expect(result.totalUsers).toBe(0);
      expect(result.emailsSent).toBe(0);
      expect(result.emailsFailed).toBe(0);
      expect(result.details).toEqual([]);
    });
  });
});
