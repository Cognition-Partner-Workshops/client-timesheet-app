const { 
  sendEmail, 
  sendTimesheetReminderEmail, 
  setTransporter, 
  resetTransporter 
} = require('../../services/emailService');

describe('Email Service', () => {
  let mockTransporter;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn()
    };
    setTransporter(mockTransporter);
  });

  afterEach(() => {
    resetTransporter();
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    test('should send email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<p>Test body</p>'
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@timesheet-app.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<p>Test body</p>'
      });
    });

    test('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'));

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<p>Test body</p>'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMTP connection failed');
    });
  });

  describe('sendTimesheetReminderEmail', () => {
    test('should send reminder email with correct content', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'reminder-message-id' });

      const result = await sendTimesheetReminderEmail('user@example.com', ['2024-01-15', '2024-01-16']);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('reminder-message-id');
      
      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.to).toBe('user@example.com');
      expect(sentEmail.subject).toBe('Reminder: Please submit your timesheet');
      expect(sentEmail.text).toContain('2024-01-15');
      expect(sentEmail.text).toContain('2024-01-16');
      expect(sentEmail.html).toContain('2024-01-15');
      expect(sentEmail.html).toContain('2024-01-16');
    });

    test('should handle single missed date', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'single-date-id' });

      const result = await sendTimesheetReminderEmail('user@example.com', ['2024-01-15']);

      expect(result.success).toBe(true);
      
      const sentEmail = mockTransporter.sendMail.mock.calls[0][0];
      expect(sentEmail.text).toContain('2024-01-15');
    });

    test('should handle email sending failure for reminder', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Network error'));

      const result = await sendTimesheetReminderEmail('user@example.com', ['2024-01-15']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
