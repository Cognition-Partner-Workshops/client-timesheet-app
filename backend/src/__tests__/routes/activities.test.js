const request = require('supertest');
const express = require('express');
const activityRoutes = require('../../routes/activities');
const { getDatabase } = require('../../database/init');

jest.mock('../../database/init');
jest.mock('../../middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.userEmail = 'test@example.com';
    next();
  }
}));

const app = express();
app.use(express.json());
app.use('/api/activities', activityRoutes);
app.use((err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({ error: 'Validation error' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

describe('Activity Routes', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn()
    };
    getDatabase.mockReturnValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/activities', () => {
    test('should return all activities for authenticated user', async () => {
      const mockActivities = [
        { id: 1, name: 'Development', description: 'Software development', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, name: 'Testing', description: 'QA testing', created_at: '2024-01-02', updated_at: '2024-01-02' }
      ];

      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, mockActivities);
      });

      const response = await request(app).get('/api/activities');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ activities: mockActivities });
      expect(mockDb.all).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, description'),
        ['test@example.com'],
        expect.any(Function)
      );
    });

    test('should return empty array when no activities exist', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      const response = await request(app).get('/api/activities');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ activities: [] });
    });

    test('should handle database error', async () => {
      mockDb.all.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/activities');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/activities/:id', () => {
    test('should return specific activity', async () => {
      const mockActivity = { id: 1, name: 'Development', description: 'Software development' };

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, mockActivity);
      });

      const response = await request(app).get('/api/activities/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ activity: mockActivity });
    });

    test('should return 404 if activity not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).get('/api/activities/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Activity not found' });
    });

    test('should return 400 for invalid activity ID', async () => {
      const response = await request(app).get('/api/activities/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid activity ID' });
    });

    test('should handle database error', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/api/activities/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /api/activities', () => {
    test('should create new activity with valid data', async () => {
      const newActivity = { name: 'New Activity', description: 'New Description' };
      const createdActivity = { id: 1, ...newActivity, created_at: '2024-01-01', updated_at: '2024-01-01' };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdActivity);
      });

      const response = await request(app)
        .post('/api/activities')
        .send(newActivity);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Activity created successfully');
      expect(response.body.activity).toEqual(createdActivity);
    });

    test('should create activity without description', async () => {
      const newActivity = { name: 'Activity Without Desc' };
      const createdActivity = { id: 1, name: 'Activity Without Desc', description: null };

      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, createdActivity);
      });

      const response = await request(app)
        .post('/api/activities')
        .send(newActivity);

      expect(response.status).toBe(201);
    });

    test('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/activities')
        .send({ description: 'No name provided' });

      expect(response.status).toBe(400);
    });

    test('should return 400 for empty name', async () => {
      const response = await request(app)
        .post('/api/activities')
        .send({ name: '' });

      expect(response.status).toBe(400);
    });

    test('should handle database insert error', async () => {
      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Insert failed'));
      });

      const response = await request(app)
        .post('/api/activities')
        .send({ name: 'Test Activity' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to create activity' });
    });

    test('should handle error retrieving activity after creation', async () => {
      mockDb.run.mockImplementation(function(query, params, callback) {
        this.lastID = 1;
        callback.call(this, null);
      });

      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Retrieval failed'), null);
      });

      const response = await request(app)
        .post('/api/activities')
        .send({ name: 'Test Activity' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Activity created but failed to retrieve' });
    });
  });

  describe('PUT /api/activities/:id', () => {
    test('should update activity name', async () => {
      const updatedActivity = { id: 1, name: 'Updated Name', description: 'Old Desc' };

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, updatedActivity);
      });

      const response = await request(app)
        .put('/api/activities/1')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Activity updated successfully');
      expect(response.body.activity).toEqual(updatedActivity);
    });

    test('should update activity description', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1, name: 'Activity', description: 'New Description' });
      });

      const response = await request(app)
        .put('/api/activities/1')
        .send({ description: 'New Description' });

      expect(response.status).toBe(200);
    });

    test('should return 404 if activity not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app)
        .put('/api/activities/999')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Activity not found' });
    });

    test('should return 400 for invalid activity ID', async () => {
      const response = await request(app)
        .put('/api/activities/invalid')
        .send({ name: 'Updated' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid activity ID' });
    });

    test('should return 400 for empty update', async () => {
      const response = await request(app)
        .put('/api/activities/1')
        .send({});

      expect(response.status).toBe(400);
    });

    test('should handle database error when checking activity existence', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .put('/api/activities/1')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    test('should handle database error during update', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Update failed'));
      });

      const response = await request(app)
        .put('/api/activities/1')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update activity' });
    });

    test('should handle error retrieving activity after update', async () => {
      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Retrieval failed'), null);
      });

      const response = await request(app)
        .put('/api/activities/1')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Activity updated but failed to retrieve' });
    });

    test('should update both name and description', async () => {
      const updatedActivity = { id: 1, name: 'New Name', description: 'New Description' };

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      mockDb.get.mockImplementationOnce((query, params, callback) => {
        callback(null, updatedActivity);
      });

      const response = await request(app)
        .put('/api/activities/1')
        .send({ name: 'New Name', description: 'New Description' });

      expect(response.status).toBe(200);
      expect(response.body.activity).toEqual(updatedActivity);
    });
  });

  describe('DELETE /api/activities/:id', () => {
    test('should delete existing activity', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(null);
      });

      const response = await request(app).delete('/api/activities/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Activity deleted successfully' });
    });

    test('should return 404 if activity not found', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, null);
      });

      const response = await request(app).delete('/api/activities/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Activity not found' });
    });

    test('should return 400 for invalid activity ID', async () => {
      const response = await request(app).delete('/api/activities/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid activity ID' });
    });

    test('should handle database delete error', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(null, { id: 1 });
      });

      mockDb.run.mockImplementation((query, params, callback) => {
        callback(new Error('Delete failed'));
      });

      const response = await request(app).delete('/api/activities/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to delete activity' });
    });

    test('should handle database error when checking activity existence', async () => {
      mockDb.get.mockImplementation((query, params, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).delete('/api/activities/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
