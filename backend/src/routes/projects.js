const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get all projects for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;

    db.all(
      `SELECT p.*, c.name as client_name 
       FROM projects p 
       JOIN clients c ON p.client_id = c.id 
       WHERE p.user_email = ? 
       ORDER BY p.created_at DESC`,
      [userEmail],
      (err, rows) => {
        if (err) {
          return next(err);
        }
        res.json({ projects: rows });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Get projects by client ID
router.get('/client/:clientId', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { clientId } = req.params;

    db.all(
      `SELECT * FROM projects WHERE client_id = ? AND user_email = ? ORDER BY name`,
      [clientId, userEmail],
      (err, rows) => {
        if (err) {
          return next(err);
        }
        res.json({ projects: rows });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Get a single project
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { id } = req.params;

    db.get(
      `SELECT p.*, c.name as client_name 
       FROM projects p 
       JOIN clients c ON p.client_id = c.id 
       WHERE p.id = ? AND p.user_email = ?`,
      [id, userEmail],
      (err, row) => {
        if (err) {
          return next(err);
        }
        if (!row) {
          return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ project: row });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Create a new project
router.post('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { clientId, name, description } = req.body;

    if (!clientId || !name) {
      return res.status(400).json({ error: 'Client ID and name are required' });
    }

    // Verify client belongs to user
    db.get(
      'SELECT id FROM clients WHERE id = ? AND user_email = ?',
      [clientId, userEmail],
      (err, client) => {
        if (err) {
          return next(err);
        }
        if (!client) {
          return res.status(404).json({ error: 'Client not found' });
        }

        db.run(
          `INSERT INTO projects (client_id, name, description, user_email) VALUES (?, ?, ?, ?)`,
          [clientId, name, description || null, userEmail],
          function(err) {
            if (err) {
              return next(err);
            }
            res.status(201).json({
              message: 'Project created successfully',
              project: {
                id: this.lastID,
                client_id: clientId,
                name,
                description: description || null,
                user_email: userEmail
              }
            });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Update a project
router.put('/:id', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { id } = req.params;
    const { name, description, clientId } = req.body;

    // Check if project exists and belongs to user
    db.get(
      'SELECT * FROM projects WHERE id = ? AND user_email = ?',
      [id, userEmail],
      (err, project) => {
        if (err) {
          return next(err);
        }
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }

        const updates = [];
        const values = [];

        if (name !== undefined) {
          updates.push('name = ?');
          values.push(name);
        }
        if (description !== undefined) {
          updates.push('description = ?');
          values.push(description);
        }
        if (clientId !== undefined) {
          updates.push('client_id = ?');
          values.push(clientId);
        }

        if (updates.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id, userEmail);

        db.run(
          `UPDATE projects SET ${updates.join(', ')} WHERE id = ? AND user_email = ?`,
          values,
          function(err) {
            if (err) {
              return next(err);
            }
            res.json({ message: 'Project updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Delete a project
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { id } = req.params;

    db.run(
      'DELETE FROM projects WHERE id = ? AND user_email = ?',
      [id, userEmail],
      function(err) {
        if (err) {
          return next(err);
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
