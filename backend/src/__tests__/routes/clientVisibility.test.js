const request = require('supertest');
const express = require('express');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    // Use the x-user-email header to set the user email for testing
    req.userEmail = req.headers['x-user-email'] || 'test@example.com';
    next();
  }
}));

const clientRoutes = require('../../routes/clients');

// Helper to create app
function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/clients', clientRoutes);
  
  // Error handler
  app.use((err, req, res, next) => {
    if (err.isJoi) {
      return res.status(400).json({ error: 'Validation error' });
    }
    res.status(500).json({ error: 'Internal server error' });
  });
  
  return app;
}

describe('Client Visibility - Different Users', () => {
  let mockDb;
  let app;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
    app = createApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/clients - All clients visible to all users', () => {
    const mockClientsFromDifferentUsers = [
      { 
        id: 1, 
        name: 'Client A', 
        description: 'Created by user1', 
        department: 'Engineering',
        email: 'clienta@example.com',
        user_email: 'user1@example.com',
        created_at: '2024-01-01', 
        updated_at: '2024-01-01' 
      },
      { 
        id: 2, 
        name: 'Client B', 
        description: 'Created by user2', 
        department: 'Marketing',
        email: 'clientb@example.com',
        user_email: 'user2@domain.org',
        created_at: '2024-01-02', 
        updated_at: '2024-01-02' 
      },
      { 
        id: 3, 
        name: 'Client C', 
        description: 'Created by user3', 
        department: 'Sales',
        email: 'clientc@example.com',
        user_email: 'admin@company.net',
        created_at: '2024-01-03', 
        updated_at: '2024-01-03' 
      }
    ];

    test('user1@example.com should see all clients including those created by other users', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockClientsFromDifferentUsers);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(3);
      expect(response.body.clients).toEqual(mockClientsFromDifferentUsers);
      // Verify query doesn't filter by user_email
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [],
        expect.any(Function)
      );
    });

    test('user2@domain.org should see all clients including those created by other users', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockClientsFromDifferentUsers);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'user2@domain.org');

      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(3);
      expect(response.body.clients).toEqual(mockClientsFromDifferentUsers);
    });

    test('admin@company.net should see all clients including those created by other users', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockClientsFromDifferentUsers);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'admin@company.net');

      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(3);
      expect(response.body.clients).toEqual(mockClientsFromDifferentUsers);
    });

    test('new user should see all existing clients', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockClientsFromDifferentUsers);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'newuser@newdomain.io');

      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(3);
    });
  });

  describe('GET /api/clients/:id - Specific client visible to all users', () => {
    const mockClient = { 
      id: 1, 
      name: 'Shared Client', 
      description: 'Created by user1',
      department: 'Engineering',
      email: 'shared@example.com',
      user_email: 'user1@example.com',
      created_at: '2024-01-01', 
      updated_at: '2024-01-01' 
    };

    test('user1@example.com (creator) should see the client', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      const response = await request(app)
        .get('/api/clients/1')
        .set('x-user-email', 'user1@example.com');

      expect(response.status).toBe(200);
      expect(response.body.client).toEqual(mockClient);
      // Verify query doesn't filter by user_email
      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [1],
        expect.any(Function)
      );
    });

    test('user2@domain.org (different user) should see client created by user1', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      const response = await request(app)
        .get('/api/clients/1')
        .set('x-user-email', 'user2@domain.org');

      expect(response.status).toBe(200);
      expect(response.body.client).toEqual(mockClient);
      expect(response.body.client.user_email).toBe('user1@example.com');
    });

    test('admin@company.net (different domain) should see client created by user1', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      const response = await request(app)
        .get('/api/clients/1')
        .set('x-user-email', 'admin@company.net');

      expect(response.status).toBe(200);
      expect(response.body.client).toEqual(mockClient);
    });
  });

  describe('Different Domain Users - Client Visibility', () => {
    const testDomains = [
      'user@gmail.com',
      'user@yahoo.com',
      'user@outlook.com',
      'user@company.org',
      'user@enterprise.net',
      'user@subdomain.domain.co.uk'
    ];

    const mockClients = [
      { id: 1, name: 'Client 1', user_email: 'creator@original.com' },
      { id: 2, name: 'Client 2', user_email: 'another@different.org' }
    ];

    testDomains.forEach(domain => {
      test(`${domain} should see all clients regardless of creator domain`, async () => {
        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, mockClients);
        });

        const response = await request(app)
          .get('/api/clients')
          .set('x-user-email', domain);

        expect(response.status).toBe(200);
        expect(response.body.clients).toHaveLength(2);
      });
    });
  });

  describe('Different Username Formats - Client Visibility', () => {
    const testUsernames = [
      'simple@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'user_name@example.com',
      'USER@EXAMPLE.COM',
      'MixedCase@Example.Com',
      '123numeric@example.com',
      'very.long.email.address.with.many.parts@subdomain.example.com'
    ];

    const mockClients = [
      { id: 1, name: 'Test Client', user_email: 'original@creator.com' }
    ];

    testUsernames.forEach(username => {
      test(`${username} should see all clients`, async () => {
        mockDb.all.mockImplementation((query, params, callback) => {
          callback(null, mockClients);
        });

        const response = await request(app)
          .get('/api/clients')
          .set('x-user-email', username);

        expect(response.status).toBe(200);
        expect(response.body.clients).toHaveLength(1);
      });
    });
  });

  describe('Client Response includes user_email field', () => {
    test('GET /api/clients should include user_email in response', async () => {
      const mockClients = [
        { 
          id: 1, 
          name: 'Client A', 
          description: 'Test',
          department: 'IT',
          email: 'client@test.com',
          user_email: 'creator@example.com',
          created_at: '2024-01-01', 
          updated_at: '2024-01-01' 
        }
      ];
      
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockClients);
      });

      const response = await request(app)
        .get('/api/clients')
        .set('x-user-email', 'viewer@example.com');

      expect(response.status).toBe(200);
      expect(response.body.clients[0]).toHaveProperty('user_email');
      expect(response.body.clients[0].user_email).toBe('creator@example.com');
    });

    test('GET /api/clients/:id should include user_email in response', async () => {
      const mockClient = { 
        id: 1, 
        name: 'Client A', 
        description: 'Test',
        department: 'IT',
        email: 'client@test.com',
        user_email: 'creator@example.com',
        created_at: '2024-01-01', 
        updated_at: '2024-01-01' 
      };
      
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockClient);
      });

      const response = await request(app)
        .get('/api/clients/1')
        .set('x-user-email', 'viewer@example.com');

      expect(response.status).toBe(200);
      expect(response.body.client).toHaveProperty('user_email');
      expect(response.body.client.user_email).toBe('creator@example.com');
    });
  });

  describe('Query verification - No user_email filter on GET', () => {
    test('GET /api/clients query should not include user_email filter', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        // Verify the query doesn't filter by user_email
        expect(query).not.toContain('WHERE user_email');
        expect(params).toEqual([]);
        callback(null, []);
      });

      await request(app)
        .get('/api/clients')
        .set('x-user-email', 'test@example.com');

      expect(mockDb.all).toHaveBeenCalled();
    });

    test('GET /api/clients/:id query should not include user_email filter', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        // Verify the query only filters by id, not user_email
        expect(query).toContain('WHERE id = ?');
        expect(query).not.toContain('AND user_email');
        expect(params).toEqual([1]);
        callback(null, { id: 1, name: 'Test' });
      });

      await request(app)
        .get('/api/clients/1')
        .set('x-user-email', 'test@example.com');

      expect(mockDb.get).toHaveBeenCalled();
    });
  });
});
