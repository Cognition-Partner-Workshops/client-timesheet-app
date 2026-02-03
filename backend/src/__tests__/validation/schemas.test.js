const {
  clientSchema,
  workEntrySchema,
  updateWorkEntrySchema,
  updateClientSchema,
  emailSchema
} = require('../../validation/schemas');

describe('Validation Schemas', () => {
  describe('clientSchema', () => {
    test('should validate valid client data', () => {
      const validClient = {
        name: 'Test Client',
        description: 'A test client'
      };

      const { error } = clientSchema.validate(validClient);
      expect(error).toBeUndefined();
    });

    test('should allow empty description', () => {
      const client = {
        name: 'Test Client',
        description: ''
      };

      const { error } = clientSchema.validate(client);
      expect(error).toBeUndefined();
    });

    test('should allow missing description', () => {
      const client = {
        name: 'Test Client'
      };

      const { error } = clientSchema.validate(client);
      expect(error).toBeUndefined();
    });

    test('should reject missing name', () => {
      const client = {
        description: 'No name'
      };

      const { error } = clientSchema.validate(client);
      expect(error).toBeDefined();
    });

    test('should reject empty name', () => {
      const client = {
        name: '',
        description: 'Empty name'
      };

      const { error } = clientSchema.validate(client);
      expect(error).toBeDefined();
    });

    test('should reject name longer than 255 characters', () => {
      const client = {
        name: 'a'.repeat(256)
      };

      const { error } = clientSchema.validate(client);
      expect(error).toBeDefined();
    });

    test('should reject description longer than 1000 characters', () => {
      const client = {
        name: 'Test',
        description: 'a'.repeat(1001)
      };

      const { error } = clientSchema.validate(client);
      expect(error).toBeDefined();
    });

    test('should trim whitespace from name', () => {
      const client = {
        name: '  Test Client  '
      };

      const { value } = clientSchema.validate(client);
      expect(value.name).toBe('Test Client');
    });
  });

  describe('workEntrySchema', () => {
    test('should validate valid work entry', () => {
      const validEntry = {
        clientId: 1,
        hours: 5.5,
        description: 'Development work',
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(validEntry);
      expect(error).toBeUndefined();
    });

    test('should allow empty description', () => {
      const entry = {
        clientId: 1,
        hours: 5,
        description: '',
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeUndefined();
    });

    test('should reject missing clientId', () => {
      const entry = {
        hours: 5,
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeDefined();
    });

    test('should reject negative clientId', () => {
      const entry = {
        clientId: -1,
        hours: 5,
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeDefined();
    });

    test('should reject zero clientId', () => {
      const entry = {
        clientId: 0,
        hours: 5,
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeDefined();
    });

    test('should reject missing hours', () => {
      const entry = {
        clientId: 1,
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeDefined();
    });

    test('should reject negative hours', () => {
      const entry = {
        clientId: 1,
        hours: -5,
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeDefined();
    });

    test('should reject hours greater than 24', () => {
      const entry = {
        clientId: 1,
        hours: 25,
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeDefined();
    });

    test('should accept decimal hours', () => {
      const entry = {
        clientId: 1,
        hours: 7.75,
        date: '2024-01-15'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeUndefined();
    });

    test('should reject missing date', () => {
      const entry = {
        clientId: 1,
        hours: 5
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeDefined();
    });

    test('should reject invalid date format', () => {
      const entry = {
        clientId: 1,
        hours: 5,
        date: '01/15/2024'
      };

      const { error } = workEntrySchema.validate(entry);
      expect(error).toBeDefined();
    });
  });

  describe('updateWorkEntrySchema', () => {
    test('should validate partial update', () => {
      const update = {
        hours: 8
      };

      const { error } = updateWorkEntrySchema.validate(update);
      expect(error).toBeUndefined();
    });

    test('should validate multiple field update', () => {
      const update = {
        hours: 8,
        description: 'Updated description'
      };

      const { error } = updateWorkEntrySchema.validate(update);
      expect(error).toBeUndefined();
    });

    test('should reject empty update', () => {
      const update = {};

      const { error } = updateWorkEntrySchema.validate(update);
      expect(error).toBeDefined();
    });

    test('should validate clientId update', () => {
      const update = {
        clientId: 2
      };

      const { error } = updateWorkEntrySchema.validate(update);
      expect(error).toBeUndefined();
    });

    test('should validate date update', () => {
      const update = {
        date: '2024-02-01'
      };

      const { error } = updateWorkEntrySchema.validate(update);
      expect(error).toBeUndefined();
    });
  });

  describe('updateClientSchema', () => {
    test('should validate name update', () => {
      const update = {
        name: 'Updated Name'
      };

      const { error } = updateClientSchema.validate(update);
      expect(error).toBeUndefined();
    });

    test('should validate description update', () => {
      const update = {
        description: 'Updated description'
      };

      const { error } = updateClientSchema.validate(update);
      expect(error).toBeUndefined();
    });

    test('should reject empty update', () => {
      const update = {};

      const { error } = updateClientSchema.validate(update);
      expect(error).toBeDefined();
    });

    test('should validate both fields update', () => {
      const update = {
        name: 'New Name',
        description: 'New Description'
      };

      const { error } = updateClientSchema.validate(update);
      expect(error).toBeUndefined();
    });
  });

  describe('emailSchema', () => {
    test('should validate valid email', () => {
      const data = {
        email: 'test@example.com'
      };

      const { error } = emailSchema.validate(data);
      expect(error).toBeUndefined();
    });

    test('should reject invalid email', () => {
      const data = {
        email: 'not-an-email'
      };

      const { error } = emailSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should reject missing email', () => {
      const data = {};

      const { error } = emailSchema.validate(data);
      expect(error).toBeDefined();
    });

    test('should accept email with subdomain', () => {
      const data = {
        email: 'user@mail.example.com'
      };

      const { error } = emailSchema.validate(data);
      expect(error).toBeUndefined();
    });
  });

  describe('Null Object Checks', () => {
    describe('clientSchema null checks', () => {
      test('should reject null input', () => {
        const { error } = clientSchema.validate(null);
        expect(error).toBeDefined();
      });

      test('should not reject undefined input (Joi treats undefined as not provided)', () => {
        const { error } = clientSchema.validate(undefined);
        expect(error).toBeUndefined();
      });

      test('should reject null name', () => {
        const client = {
          name: null,
          description: 'Test description'
        };

        const { error } = clientSchema.validate(client);
        expect(error).toBeDefined();
      });

      test('should reject null description', () => {
        const client = {
          name: 'Test Client',
          description: null
        };

        const { error } = clientSchema.validate(client);
        expect(error).toBeDefined();
      });
    });

    describe('workEntrySchema null checks', () => {
      test('should reject null input', () => {
        const { error } = workEntrySchema.validate(null);
        expect(error).toBeDefined();
      });

      test('should not reject undefined input (Joi treats undefined as not provided)', () => {
        const { error } = workEntrySchema.validate(undefined);
        expect(error).toBeUndefined();
      });

      test('should reject null clientId', () => {
        const entry = {
          clientId: null,
          hours: 5,
          date: '2024-01-15'
        };

        const { error } = workEntrySchema.validate(entry);
        expect(error).toBeDefined();
      });

      test('should reject null hours', () => {
        const entry = {
          clientId: 1,
          hours: null,
          date: '2024-01-15'
        };

        const { error } = workEntrySchema.validate(entry);
        expect(error).toBeDefined();
      });

      test('should reject null date', () => {
        const entry = {
          clientId: 1,
          hours: 5,
          date: null
        };

        const { error } = workEntrySchema.validate(entry);
        expect(error).toBeDefined();
      });

      test('should reject null description', () => {
        const entry = {
          clientId: 1,
          hours: 5,
          description: null,
          date: '2024-01-15'
        };

        const { error } = workEntrySchema.validate(entry);
        expect(error).toBeDefined();
      });
    });

    describe('updateWorkEntrySchema null checks', () => {
      test('should reject null input', () => {
        const { error } = updateWorkEntrySchema.validate(null);
        expect(error).toBeDefined();
      });

      test('should not reject undefined input (Joi treats undefined as not provided)', () => {
        const { error } = updateWorkEntrySchema.validate(undefined);
        expect(error).toBeUndefined();
      });

      test('should reject null clientId in update', () => {
        const update = {
          clientId: null
        };

        const { error } = updateWorkEntrySchema.validate(update);
        expect(error).toBeDefined();
      });

      test('should reject null hours in update', () => {
        const update = {
          hours: null
        };

        const { error } = updateWorkEntrySchema.validate(update);
        expect(error).toBeDefined();
      });

      test('should reject null date in update', () => {
        const update = {
          date: null
        };

        const { error } = updateWorkEntrySchema.validate(update);
        expect(error).toBeDefined();
      });
    });

    describe('updateClientSchema null checks', () => {
      test('should reject null input', () => {
        const { error } = updateClientSchema.validate(null);
        expect(error).toBeDefined();
      });

      test('should not reject undefined input (Joi treats undefined as not provided)', () => {
        const { error } = updateClientSchema.validate(undefined);
        expect(error).toBeUndefined();
      });

      test('should reject null name in update', () => {
        const update = {
          name: null
        };

        const { error } = updateClientSchema.validate(update);
        expect(error).toBeDefined();
      });
    });

    describe('emailSchema null checks', () => {
      test('should reject null input', () => {
        const { error } = emailSchema.validate(null);
        expect(error).toBeDefined();
      });

      test('should not reject undefined input (Joi treats undefined as not provided)', () => {
        const { error } = emailSchema.validate(undefined);
        expect(error).toBeUndefined();
      });

      test('should reject null email', () => {
        const data = {
          email: null
        };

        const { error } = emailSchema.validate(data);
        expect(error).toBeDefined();
      });
    });
  });
});
