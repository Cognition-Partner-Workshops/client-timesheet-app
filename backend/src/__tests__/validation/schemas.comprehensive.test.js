const {
  clientSchema,
  workEntrySchema,
  updateWorkEntrySchema,
  updateClientSchema,
  emailSchema
} = require('../../validation/schemas');

describe('Validation Schemas - Comprehensive Coverage', () => {
  describe('clientSchema - Department Field', () => {
    test('should accept valid department', () => {
      const { error } = clientSchema.validate({ name: 'Client', department: 'Engineering' });
      expect(error).toBeUndefined();
    });

    test('should accept empty department', () => {
      const { error } = clientSchema.validate({ name: 'Client', department: '' });
      expect(error).toBeUndefined();
    });

    test('should accept missing department', () => {
      const { error } = clientSchema.validate({ name: 'Client' });
      expect(error).toBeUndefined();
    });

    test('should accept department at max length 255', () => {
      const { error } = clientSchema.validate({ name: 'Client', department: 'a'.repeat(255) });
      expect(error).toBeUndefined();
    });

    test('should trim whitespace from department', () => {
      const { value } = clientSchema.validate({ name: 'Client', department: '  Engineering  ' });
      expect(value.department).toBe('Engineering');
    });

    test('should reject department exceeding 255 chars', () => {
      const { error } = clientSchema.validate({ name: 'Client', department: 'a'.repeat(256) });
      expect(error).toBeDefined();
    });
  });

  describe('clientSchema - Email Field', () => {
    test('should accept valid email', () => {
      const { error } = clientSchema.validate({ name: 'Client', email: 'test@example.com' });
      expect(error).toBeUndefined();
    });

    test('should accept empty email', () => {
      const { error } = clientSchema.validate({ name: 'Client', email: '' });
      expect(error).toBeUndefined();
    });

    test('should accept missing email', () => {
      const { error } = clientSchema.validate({ name: 'Client' });
      expect(error).toBeUndefined();
    });

    test('should reject invalid email format', () => {
      const { error } = clientSchema.validate({ name: 'Client', email: 'not-an-email' });
      expect(error).toBeDefined();
    });

    test('should reject email without domain', () => {
      const { error } = clientSchema.validate({ name: 'Client', email: 'user@' });
      expect(error).toBeDefined();
    });

    test('should accept email with subdomain', () => {
      const { error } = clientSchema.validate({ name: 'Client', email: 'user@mail.example.com' });
      expect(error).toBeUndefined();
    });

    test('should accept email with plus addressing', () => {
      const { error } = clientSchema.validate({ name: 'Client', email: 'user+tag@example.com' });
      expect(error).toBeUndefined();
    });
  });

  describe('clientSchema - All Fields Together', () => {
    test('should accept all fields provided', () => {
      const { error } = clientSchema.validate({
        name: 'Full Client',
        description: 'A description',
        department: 'Engineering',
        email: 'client@example.com'
      });
      expect(error).toBeUndefined();
    });

    test('should reject unknown fields', () => {
      const { error } = clientSchema.validate({
        name: 'Client',
        unknownField: 'value'
      });
      expect(error).toBeDefined();
    });
  });

  describe('updateClientSchema - Department and Email', () => {
    test('should accept department-only update', () => {
      const { error } = updateClientSchema.validate({ department: 'New Dept' });
      expect(error).toBeUndefined();
    });

    test('should accept email-only update', () => {
      const { error } = updateClientSchema.validate({ email: 'new@example.com' });
      expect(error).toBeUndefined();
    });

    test('should accept empty values for department and email', () => {
      const { error } = updateClientSchema.validate({ department: '', email: '' });
      expect(error).toBeUndefined();
    });

    test('should reject invalid email in update', () => {
      const { error } = updateClientSchema.validate({ email: 'bad-email' });
      expect(error).toBeDefined();
    });

    test('should reject department exceeding 255 chars in update', () => {
      const { error } = updateClientSchema.validate({ department: 'a'.repeat(256) });
      expect(error).toBeDefined();
    });

    test('should accept all fields in update', () => {
      const { error } = updateClientSchema.validate({
        name: 'Updated',
        description: 'Desc',
        department: 'Dept',
        email: 'e@e.com'
      });
      expect(error).toBeUndefined();
    });

    test('should require at least one field', () => {
      const { error } = updateClientSchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('workEntrySchema - Boundary Values', () => {
    test('should accept hours exactly at 24', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 24, date: '2024-01-15' });
      expect(error).toBeUndefined();
    });

    test('should reject hours at 0', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 0, date: '2024-01-15' });
      expect(error).toBeDefined();
    });

    test('should accept hours at 0.01', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 0.01, date: '2024-01-15' });
      expect(error).toBeUndefined();
    });

    test('should reject hours at 24.01', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 24.01, date: '2024-01-15' });
      expect(error).toBeDefined();
    });

    test('should accept clientId of 1', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 5, date: '2024-01-15' });
      expect(error).toBeUndefined();
    });

    test('should accept large clientId', () => {
      const { error } = workEntrySchema.validate({ clientId: 999999, hours: 5, date: '2024-01-15' });
      expect(error).toBeUndefined();
    });

    test('should accept description at max length 1000', () => {
      const { error } = workEntrySchema.validate({
        clientId: 1, hours: 5, description: 'a'.repeat(1000), date: '2024-01-15'
      });
      expect(error).toBeUndefined();
    });

    test('should reject description exceeding 1000', () => {
      const { error } = workEntrySchema.validate({
        clientId: 1, hours: 5, description: 'a'.repeat(1001), date: '2024-01-15'
      });
      expect(error).toBeDefined();
    });
  });

  describe('workEntrySchema - Type Coercion', () => {
    test('should reject string hours', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 'five', date: '2024-01-15' });
      expect(error).toBeDefined();
    });

    test('should reject string clientId', () => {
      const { error } = workEntrySchema.validate({ clientId: 'one', hours: 5, date: '2024-01-15' });
      expect(error).toBeDefined();
    });

    test('should reject null hours', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: null, date: '2024-01-15' });
      expect(error).toBeDefined();
    });

    test('should reject negative clientId', () => {
      const { error } = workEntrySchema.validate({ clientId: -1, hours: 5, date: '2024-01-15' });
      expect(error).toBeDefined();
    });

    test('should reject zero clientId', () => {
      const { error } = workEntrySchema.validate({ clientId: 0, hours: 5, date: '2024-01-15' });
      expect(error).toBeDefined();
    });

    test('should reject non-integer clientId (float)', () => {
      const { error } = workEntrySchema.validate({ clientId: 1.5, hours: 5, date: '2024-01-15' });
      expect(error).toBeDefined();
    });
  });

  describe('workEntrySchema - Date Format', () => {
    test('should accept ISO date YYYY-MM-DD', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 5, date: '2024-01-15' });
      expect(error).toBeUndefined();
    });

    test('should accept ISO datetime', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 5, date: '2024-01-15T10:30:00' });
      expect(error).toBeUndefined();
    });

    test('should reject DD-MM-YYYY format', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 5, date: '15-01-2024' });
      expect(error).toBeDefined();
    });

    test('should reject empty date', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 5, date: '' });
      expect(error).toBeDefined();
    });

    test('should reject missing date', () => {
      const { error } = workEntrySchema.validate({ clientId: 1, hours: 5 });
      expect(error).toBeDefined();
    });
  });

  describe('updateWorkEntrySchema - Extended', () => {
    test('should accept description-only update', () => {
      const { error } = updateWorkEntrySchema.validate({ description: 'Updated desc' });
      expect(error).toBeUndefined();
    });

    test('should accept empty description', () => {
      const { error } = updateWorkEntrySchema.validate({ description: '' });
      expect(error).toBeUndefined();
    });

    test('should reject hours at 0 in update', () => {
      const { error } = updateWorkEntrySchema.validate({ hours: 0 });
      expect(error).toBeDefined();
    });

    test('should reject negative hours in update', () => {
      const { error } = updateWorkEntrySchema.validate({ hours: -5 });
      expect(error).toBeDefined();
    });

    test('should reject zero clientId in update', () => {
      const { error } = updateWorkEntrySchema.validate({ clientId: 0 });
      expect(error).toBeDefined();
    });

    test('should reject negative clientId in update', () => {
      const { error } = updateWorkEntrySchema.validate({ clientId: -1 });
      expect(error).toBeDefined();
    });

    test('should accept full update with all fields', () => {
      const { error } = updateWorkEntrySchema.validate({
        clientId: 2,
        hours: 10,
        description: 'Updated',
        date: '2024-06-01'
      });
      expect(error).toBeUndefined();
    });

    test('should reject invalid date in update', () => {
      const { error } = updateWorkEntrySchema.validate({ date: 'not-a-date' });
      expect(error).toBeDefined();
    });

    test('should reject description exceeding 1000 chars in update', () => {
      const { error } = updateWorkEntrySchema.validate({ description: 'a'.repeat(1001) });
      expect(error).toBeDefined();
    });

    test('should require at least one field', () => {
      const { error } = updateWorkEntrySchema.validate({});
      expect(error).toBeDefined();
    });
  });

  describe('emailSchema - Extended', () => {
    test('should accept valid email', () => {
      const { error } = emailSchema.validate({ email: 'user@example.com' });
      expect(error).toBeUndefined();
    });

    test('should reject email with spaces', () => {
      const { error } = emailSchema.validate({ email: 'user @example.com' });
      expect(error).toBeDefined();
    });

    test('should reject email without TLD', () => {
      const { error } = emailSchema.validate({ email: 'user@localhost' });
      expect(error).toBeDefined();
    });

    test('should reject empty email', () => {
      const { error } = emailSchema.validate({ email: '' });
      expect(error).toBeDefined();
    });

    test('should reject missing email', () => {
      const { error } = emailSchema.validate({});
      expect(error).toBeDefined();
    });

    test('should accept email with numbers', () => {
      const { error } = emailSchema.validate({ email: 'user123@example.com' });
      expect(error).toBeUndefined();
    });

    test('should accept email with dots in local part', () => {
      const { error } = emailSchema.validate({ email: 'first.last@example.com' });
      expect(error).toBeUndefined();
    });

    test('should accept email with hyphen in domain', () => {
      const { error } = emailSchema.validate({ email: 'user@my-domain.com' });
      expect(error).toBeUndefined();
    });

    test('should reject null email', () => {
      const { error } = emailSchema.validate({ email: null });
      expect(error).toBeDefined();
    });

    test('should reject number type for email', () => {
      const { error } = emailSchema.validate({ email: 12345 });
      expect(error).toBeDefined();
    });
  });

  describe('clientSchema - Name Boundary Values', () => {
    test('should accept 1 character name', () => {
      const { error } = clientSchema.validate({ name: 'A' });
      expect(error).toBeUndefined();
    });

    test('should accept 255 character name', () => {
      const { error } = clientSchema.validate({ name: 'a'.repeat(255) });
      expect(error).toBeUndefined();
    });

    test('should reject 0 character name (empty after trim)', () => {
      const { error } = clientSchema.validate({ name: '' });
      expect(error).toBeDefined();
    });

    test('should reject 256 character name', () => {
      const { error } = clientSchema.validate({ name: 'a'.repeat(256) });
      expect(error).toBeDefined();
    });

    test('should accept description at 1000 chars', () => {
      const { error } = clientSchema.validate({ name: 'Client', description: 'a'.repeat(1000) });
      expect(error).toBeUndefined();
    });

    test('should reject description at 1001 chars', () => {
      const { error } = clientSchema.validate({ name: 'Client', description: 'a'.repeat(1001) });
      expect(error).toBeDefined();
    });

    test('should trim whitespace from name', () => {
      const { value } = clientSchema.validate({ name: '  Trimmed  ' });
      expect(value.name).toBe('Trimmed');
    });
  });

  describe('updateClientSchema - Extended', () => {
    test('should reject whitespace-only name after trim', () => {
      const { error } = updateClientSchema.validate({ name: '   ' });
      expect(error).toBeDefined();
    });

    test('should accept name at max length 255', () => {
      const { error } = updateClientSchema.validate({ name: 'a'.repeat(255) });
      expect(error).toBeUndefined();
    });

    test('should reject name exceeding 255', () => {
      const { error } = updateClientSchema.validate({ name: 'a'.repeat(256) });
      expect(error).toBeDefined();
    });

    test('should trim whitespace from name in update', () => {
      const { value } = updateClientSchema.validate({ name: '  Updated  ' });
      expect(value.name).toBe('Updated');
    });

    test('should accept description at max length 1000', () => {
      const { error } = updateClientSchema.validate({ description: 'a'.repeat(1000) });
      expect(error).toBeUndefined();
    });

    test('should reject description exceeding 1000', () => {
      const { error } = updateClientSchema.validate({ description: 'a'.repeat(1001) });
      expect(error).toBeDefined();
    });
  });
});
