const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { workEntrySchema, updateWorkEntrySchema } = require('../validation/schemas');

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get all work entries for authenticated user (with optional client filter)
router.get('/', async (req, res, next) => {
  try {
    const { clientId } = req.query;
    const db = getDatabase();

    let query = `
      SELECT we.id, we.client_id, we.hours, we.description, we.date, 
             we.created_at, we.updated_at, c.name as client_name
      FROM work_entries we
      JOIN clients c ON we.client_id = c.id
      WHERE we.user_email = $1
    `;

    const params = [req.userEmail];

    if (clientId) {
      const clientIdNum = parseInt(clientId);
      if (isNaN(clientIdNum)) {
        return res.status(400).json({ error: 'Invalid client ID' });
      }
      query += ' AND we.client_id = $2';
      params.push(clientIdNum);
    }

    query += ' ORDER BY we.date DESC, we.created_at DESC';

    const result = await db.query(query, params);
    res.json({ workEntries: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    next(error);
  }
});

// Get specific work entry
router.get('/:id', async (req, res, next) => {
  try {
    const workEntryId = parseInt(req.params.id);

    if (isNaN(workEntryId)) {
      return res.status(400).json({ error: 'Invalid work entry ID' });
    }

    const db = getDatabase();

    const result = await db.query(
      `SELECT we.id, we.client_id, we.hours, we.description, we.date, 
              we.created_at, we.updated_at, c.name as client_name
       FROM work_entries we
       JOIN clients c ON we.client_id = c.id
       WHERE we.id = $1 AND we.user_email = $2`,
      [workEntryId, req.userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Work entry not found' });
    }

    res.json({ workEntry: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    next(error);
  }
});

// Create new work entry
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = workEntrySchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { clientId, hours, description, date } = value;
    const db = getDatabase();

    // Verify client exists and belongs to user
    const clientCheck = await db.query(
      'SELECT id FROM clients WHERE id = $1 AND user_email = $2',
      [clientId, req.userEmail]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Client not found or does not belong to user' });
    }

    // Create work entry and return with client name
    const insertResult = await db.query(
      `INSERT INTO work_entries (client_id, user_email, hours, description, date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, client_id, hours, description, date, created_at, updated_at`,
      [clientId, req.userEmail, hours, description || null, date]
    );

    // Get client name for response
    const workEntryResult = await db.query(
      `SELECT we.id, we.client_id, we.hours, we.description, we.date, 
              we.created_at, we.updated_at, c.name as client_name
       FROM work_entries we
       JOIN clients c ON we.client_id = c.id
       WHERE we.id = $1`,
      [insertResult.rows[0].id]
    );

    res.status(201).json({
      message: 'Work entry created successfully',
      workEntry: workEntryResult.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to create work entry' });
    }
    next(error);
  }
});

// Update work entry
router.put('/:id', async (req, res, next) => {
  try {
    const workEntryId = parseInt(req.params.id);

    if (isNaN(workEntryId)) {
      return res.status(400).json({ error: 'Invalid work entry ID' });
    }

    const { error, value } = updateWorkEntrySchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const db = getDatabase();

    // Check if work entry exists and belongs to user
    const checkResult = await db.query(
      'SELECT id FROM work_entries WHERE id = $1 AND user_email = $2',
      [workEntryId, req.userEmail]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Work entry not found' });
    }

    // If clientId is being updated, verify it belongs to user
    if (value.clientId) {
      const clientCheck = await db.query(
        'SELECT id FROM clients WHERE id = $1 AND user_email = $2',
        [value.clientId, req.userEmail]
      );

      if (clientCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Client not found or does not belong to user' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (value.clientId !== undefined) {
      updates.push(`client_id = $${paramIndex++}`);
      values.push(value.clientId);
    }

    if (value.hours !== undefined) {
      updates.push(`hours = $${paramIndex++}`);
      values.push(value.hours);
    }

    if (value.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(value.description || null);
    }

    if (value.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(value.date);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(workEntryId, req.userEmail);

    const query = `UPDATE work_entries SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_email = $${paramIndex}`;

    await db.query(query, values);

    // Return updated work entry with client name
    const updatedResult = await db.query(
      `SELECT we.id, we.client_id, we.hours, we.description, we.date, 
              we.created_at, we.updated_at, c.name as client_name
       FROM work_entries we
       JOIN clients c ON we.client_id = c.id
       WHERE we.id = $1`,
      [workEntryId]
    );

    res.json({
      message: 'Work entry updated successfully',
      workEntry: updatedResult.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to update work entry' });
    }
    next(error);
  }
});

// Delete work entry
router.delete('/:id', async (req, res, next) => {
  try {
    const workEntryId = parseInt(req.params.id);

    if (isNaN(workEntryId)) {
      return res.status(400).json({ error: 'Invalid work entry ID' });
    }

    const db = getDatabase();

    // Check if work entry exists and belongs to user
    const checkResult = await db.query(
      'SELECT id FROM work_entries WHERE id = $1 AND user_email = $2',
      [workEntryId, req.userEmail]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Work entry not found' });
    }

    // Delete work entry
    await db.query(
      'DELETE FROM work_entries WHERE id = $1 AND user_email = $2',
      [workEntryId, req.userEmail]
    );

    res.json({ message: 'Work entry deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to delete work entry' });
    }
    next(error);
  }
});

module.exports = router;
