const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { clientSchema, updateClientSchema } = require('../validation/schemas');

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get all clients for authenticated user
router.get('/', async (req, res, next) => {
  try {
    const db = getDatabase();

    const result = await db.query(
      'SELECT id, name, description, created_at, updated_at FROM clients WHERE user_email = $1 ORDER BY name',
      [req.userEmail]
    );

    res.json({ clients: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    next(error);
  }
});

// Get specific client
router.get('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const db = getDatabase();

    const result = await db.query(
      'SELECT id, name, description, created_at, updated_at FROM clients WHERE id = $1 AND user_email = $2',
      [clientId, req.userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    next(error);
  }
});

// Create new client
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { name, description } = value;
    const db = getDatabase();

    const insertResult = await db.query(
      'INSERT INTO clients (name, description, user_email) VALUES ($1, $2, $3) RETURNING id, name, description, created_at, updated_at',
      [name, description || null, req.userEmail]
    );

    res.status(201).json({
      message: 'Client created successfully',
      client: insertResult.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to create client' });
    }
    next(error);
  }
});

// Update client
router.put('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const { error, value } = updateClientSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const db = getDatabase();

    // Check if client exists and belongs to user
    const checkResult = await db.query(
      'SELECT id FROM clients WHERE id = $1 AND user_email = $2',
      [clientId, req.userEmail]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (value.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(value.name);
    }

    if (value.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(value.description || null);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(clientId, req.userEmail);

    const query = `UPDATE clients SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_email = $${paramIndex} RETURNING id, name, description, created_at, updated_at`;

    const updateResult = await db.query(query, values);

    res.json({
      message: 'Client updated successfully',
      client: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to update client' });
    }
    next(error);
  }
});

// Delete client
router.delete('/:id', async (req, res, next) => {
  try {
    const clientId = parseInt(req.params.id);

    if (isNaN(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    const db = getDatabase();

    // Check if client exists and belongs to user
    const checkResult = await db.query(
      'SELECT id FROM clients WHERE id = $1 AND user_email = $2',
      [clientId, req.userEmail]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Delete client (work entries will be deleted due to CASCADE)
    await db.query(
      'DELETE FROM clients WHERE id = $1 AND user_email = $2',
      [clientId, req.userEmail]
    );

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to delete client' });
    }
    next(error);
  }
});

module.exports = router;
