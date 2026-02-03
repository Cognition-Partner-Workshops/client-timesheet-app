/**
 * @fileoverview Client management routes for the Time Tracker application.
 * Provides CRUD operations for managing client records associated with authenticated users.
 * All routes require authentication via the x-user-email header.
 * @module routes/clients
 */

const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { clientSchema, updateClientSchema } = require('../validation/schemas');

const router = express.Router();

/** Apply authentication middleware to all routes in this module */
router.use(authenticateUser);

/**
 * GET /api/clients
 * Retrieves all clients belonging to the authenticated user.
 * @route GET /api/clients
 * @returns {Object} 200 - Success response with clients array
 * @returns {Object} 500 - Internal server error
 * @example
 * // Response: { clients: [{ id, name, description, department, email, created_at, updated_at }] }
 */
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT id, name, description, department, email, created_at, updated_at FROM clients WHERE user_email = ? ORDER BY name',
    [req.userEmail],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json({ clients: rows });
    }
  );
});

/**
 * GET /api/clients/:id
 * Retrieves a specific client by ID for the authenticated user.
 * @route GET /api/clients/:id
 * @param {number} id - The client ID (URL parameter)
 * @returns {Object} 200 - Success response with client object
 * @returns {Object} 400 - Invalid client ID format
 * @returns {Object} 404 - Client not found
 * @returns {Object} 500 - Internal server error
 */
router.get('/:id', (req, res) => {
  const clientId = parseInt(req.params.id);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  const db = getDatabase();
  
  db.get(
    'SELECT id, name, description, department, email, created_at, updated_at FROM clients WHERE id = ? AND user_email = ?',
    [clientId, req.userEmail],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      res.json({ client: row });
    }
  );
});

/**
 * POST /api/clients
 * Creates a new client for the authenticated user.
 * @route POST /api/clients
 * @param {Object} body - Request body
 * @param {string} body.name - Client name (required)
 * @param {string} [body.description] - Client description (optional)
 * @param {string} [body.department] - Client department (optional)
 * @param {string} [body.email] - Client email (optional)
 * @returns {Object} 201 - Success response with created client
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Internal server error
 */
router.post('/', (req, res, next) => {
  try {
    const { error, value } = clientSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { name, description, department, email } = value;
    const db = getDatabase();

    db.run(
      'INSERT INTO clients (name, description, department, email, user_email) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, department || null, email || null, req.userEmail],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create client' });
        }

        // Return the created client
        db.get(
          'SELECT id, name, description, department, email, created_at, updated_at FROM clients WHERE id = ?',
          [this.lastID],
          (err, row) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Client created but failed to retrieve' });
            }

            res.status(201).json({ 
              message: 'Client created successfully',
              client: row 
            });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/clients/:id
 * Updates an existing client for the authenticated user.
 * Only provided fields will be updated; omitted fields remain unchanged.
 * @route PUT /api/clients/:id
 * @param {number} id - The client ID (URL parameter)
 * @param {Object} body - Request body with fields to update
 * @param {string} [body.name] - Updated client name
 * @param {string} [body.description] - Updated client description
 * @param {string} [body.department] - Updated client department
 * @param {string} [body.email] - Updated client email
 * @returns {Object} 200 - Success response with updated client
 * @returns {Object} 400 - Invalid client ID or validation error
 * @returns {Object} 404 - Client not found
 * @returns {Object} 500 - Internal server error
 */
router.put('/:id', (req, res, next) => {
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
    db.get(
      'SELECT id FROM clients WHERE id = ? AND user_email = ?',
      [clientId, req.userEmail],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
          return res.status(404).json({ error: 'Client not found' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (value.name !== undefined) {
          updates.push('name = ?');
          values.push(value.name);
        }

        if (value.description !== undefined) {
          updates.push('description = ?');
          values.push(value.description || null);
        }

        if (value.department !== undefined) {
          updates.push('department = ?');
          values.push(value.department || null);
        }

        if (value.email !== undefined) {
          updates.push('email = ?');
          values.push(value.email || null);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(clientId, req.userEmail);

        const query = `UPDATE clients SET ${updates.join(', ')} WHERE id = ? AND user_email = ?`;

        db.run(query, values, function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update client' });
          }

          // Return updated client
          db.get(
            'SELECT id, name, description, department, email, created_at, updated_at FROM clients WHERE id = ?',
            [clientId],
            (err, row) => {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Client updated but failed to retrieve' });
              }

              res.json({
                message: 'Client updated successfully',
                client: row
              });
            }
          );
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/clients
 * Deletes all clients belonging to the authenticated user.
 * Associated work entries are also deleted due to CASCADE constraint.
 * @route DELETE /api/clients
 * @returns {Object} 200 - Success response with deleted count
 * @returns {Object} 500 - Internal server error
 * @example
 * // Response: { message: 'All clients deleted successfully', deletedCount: 5 }
 */
router.delete('/', (req, res) => {
  const db = getDatabase();
  
  db.run(
    'DELETE FROM clients WHERE user_email = ?',
    [req.userEmail],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete clients' });
      }
      
      res.json({ 
        message: 'All clients deleted successfully',
        deletedCount: this.changes
      });
    }
  );
});

/**
 * DELETE /api/clients/:id
 * Deletes a specific client by ID for the authenticated user.
 * Associated work entries are also deleted due to CASCADE constraint.
 * @route DELETE /api/clients/:id
 * @param {number} id - The client ID (URL parameter)
 * @returns {Object} 200 - Success response
 * @returns {Object} 400 - Invalid client ID format
 * @returns {Object} 404 - Client not found
 * @returns {Object} 500 - Internal server error
 */
router.delete('/:id', (req, res) => {
  const clientId = parseInt(req.params.id);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  const db = getDatabase();
  
  // Check if client exists and belongs to user
  db.get(
    'SELECT id FROM clients WHERE id = ? AND user_email = ?',
    [clientId, req.userEmail],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Delete client (work entries will be deleted due to CASCADE)
      db.run(
        'DELETE FROM clients WHERE id = ? AND user_email = ?',
        [clientId, req.userEmail],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to delete client' });
          }
          
          res.json({ message: 'Client deleted successfully' });
        }
      );
    }
  );
});

module.exports = router;
