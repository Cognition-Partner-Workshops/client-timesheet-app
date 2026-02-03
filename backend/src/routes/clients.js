/**
 * @fileoverview Client management routes for the Client Timesheet Application.
 * Provides CRUD operations for managing client records associated with authenticated users.
 * All routes require authentication via the x-user-email header.
 * 
 * @module routes/clients
 * @requires express
 * @requires ../database/init
 * @requires ../middleware/auth
 * @requires ../validation/schemas
 */

const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { clientSchema, updateClientSchema } = require('../validation/schemas');

/**
 * Express router for client management endpoints
 * @type {express.Router}
 */
const router = express.Router();

/**
 * Apply authentication middleware to all client routes
 * All endpoints in this router require a valid x-user-email header
 */
router.use(authenticateUser);

/**
 * @route GET /api/clients
 * @description Retrieves all clients belonging to the authenticated user, ordered by name.
 * 
 * @param {string} req.headers.x-user-email - Authenticated user's email
 * 
 * @returns {Object} 200 - Array of client objects
 * @returns {Object} 401 - Authentication required
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Response (200)
 * { "clients": [{ "id": 1, "name": "Acme Corp", "description": "Main client", ... }] }
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
 * @route GET /api/clients/:id
 * @description Retrieves a specific client by ID. Only returns clients owned by the authenticated user.
 * 
 * @param {string} req.params.id - Client ID (must be a valid integer)
 * @param {string} req.headers.x-user-email - Authenticated user's email
 * 
 * @returns {Object} 200 - Client object
 * @returns {Object} 400 - Invalid client ID format
 * @returns {Object} 401 - Authentication required
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
 * @route POST /api/clients
 * @description Creates a new client for the authenticated user.
 * Validates input using Joi schema before creating the record.
 * 
 * @param {Object} req.body - Client data
 * @param {string} req.body.name - Client name (required, 1-255 characters)
 * @param {string} [req.body.description] - Client description (optional, max 1000 characters)
 * @param {string} [req.body.department] - Client department (optional, max 255 characters)
 * @param {string} [req.body.email] - Client email (optional, valid email format)
 * @param {string} req.headers.x-user-email - Authenticated user's email
 * 
 * @returns {Object} 201 - Created client object with success message
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Authentication required
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
 * @route PUT /api/clients/:id
 * @description Updates an existing client. Only allows updating clients owned by the authenticated user.
 * Supports partial updates - only provided fields will be modified.
 * 
 * @param {string} req.params.id - Client ID (must be a valid integer)
 * @param {Object} req.body - Client data to update (at least one field required)
 * @param {string} [req.body.name] - Client name (1-255 characters)
 * @param {string} [req.body.description] - Client description (max 1000 characters)
 * @param {string} [req.body.department] - Client department (max 255 characters)
 * @param {string} [req.body.email] - Client email (valid email format)
 * @param {string} req.headers.x-user-email - Authenticated user's email
 * 
 * @returns {Object} 200 - Updated client object with success message
 * @returns {Object} 400 - Invalid client ID or validation error
 * @returns {Object} 401 - Authentication required
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
 * @route DELETE /api/clients
 * @description Deletes all clients for the authenticated user.
 * Also deletes all associated work entries due to cascade delete.
 * 
 * @param {string} req.headers.x-user-email - Authenticated user's email
 * 
 * @returns {Object} 200 - Success message with deleted count
 * @returns {Object} 401 - Authentication required
 * @returns {Object} 500 - Internal server error
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
 * @route DELETE /api/clients/:id
 * @description Deletes a client and all associated work entries (cascade delete).
 * Only allows deleting clients owned by the authenticated user.
 * 
 * @param {string} req.params.id - Client ID (must be a valid integer)
 * @param {string} req.headers.x-user-email - Authenticated user's email
 * 
 * @returns {Object} 200 - Success message
 * @returns {Object} 400 - Invalid client ID format
 * @returns {Object} 401 - Authentication required
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
