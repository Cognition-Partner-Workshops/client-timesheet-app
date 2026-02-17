/**
 * @file Client CRUD routes.
 *
 * All endpoints require authentication via the `x-user-email` header
 * (enforced by the {@link authenticateUser} middleware applied at the router
 * level).  Clients are scoped to the authenticated user – a user can only
 * view, create, update, or delete their own clients.
 *
 * Routes:
 * - `GET    /api/clients`     – List all clients for the authenticated user.
 * - `GET    /api/clients/:id` – Retrieve a single client by ID.
 * - `POST   /api/clients`     – Create a new client.
 * - `PUT    /api/clients/:id` – Partially update an existing client.
 * - `DELETE /api/clients`     – Delete **all** clients for the authenticated user.
 * - `DELETE /api/clients/:id` – Delete a single client (cascades to work entries).
 *
 * @module routes/clients
 */

const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { clientSchema, updateClientSchema } = require('../validation/schemas');

const router = express.Router();

router.use(authenticateUser);

/**
 * GET /
 *
 * Returns every client belonging to the authenticated user, ordered
 * alphabetically by name.
 *
 * @route GET /api/clients
 * @returns {Object} 200 – `{ clients: Array<ClientRow> }`
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
 * GET /:id
 *
 * Returns a single client identified by its numeric ID, provided it belongs
 * to the authenticated user.
 *
 * @route GET /api/clients/:id
 * @param {string} req.params.id - Numeric client ID.
 * @returns {Object} 200 – `{ client: ClientRow }`
 * @throws  400 if the ID is not a valid integer.
 * @throws  404 if the client does not exist or belongs to another user.
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
 * POST /
 *
 * Creates a new client for the authenticated user.  The request body is
 * validated against {@link clientSchema}.
 *
 * @route POST /api/clients
 * @param {Object} req.body
 * @param {string} req.body.name              - Client name (required).
 * @param {string} [req.body.description]     - Optional description.
 * @param {string} [req.body.department]       - Optional department.
 * @param {string} [req.body.email]            - Optional contact email.
 * @returns {Object} 201 – `{ message, client: ClientRow }`
 * @throws  400 when validation fails.
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
 * PUT /:id
 *
 * Partially updates an existing client.  Only the supplied fields are
 * changed; the `updated_at` timestamp is always refreshed.  The request body
 * is validated against {@link updateClientSchema} (at least one field
 * required).
 *
 * @route PUT /api/clients/:id
 * @param {string} req.params.id - Numeric client ID.
 * @param {Object} req.body      - Fields to update (name, description, department, email).
 * @returns {Object} 200 – `{ message, client: ClientRow }`
 * @throws  400 if the ID is invalid or validation fails.
 * @throws  404 if the client does not exist or belongs to another user.
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
 * DELETE /
 *
 * Removes **all** clients owned by the authenticated user.  Associated work
 * entries are also removed via the database CASCADE constraint.
 *
 * @route DELETE /api/clients
 * @returns {Object} 200 – `{ message, deletedCount: number }`
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
 * DELETE /:id
 *
 * Deletes a single client by ID.  The database CASCADE constraint
 * automatically removes any related work entries.
 *
 * @route DELETE /api/clients/:id
 * @param {string} req.params.id - Numeric client ID.
 * @returns {Object} 200 – `{ message }`
 * @throws  400 if the ID is not a valid integer.
 * @throws  404 if the client does not exist or belongs to another user.
 */
router.delete('/:id', (req, res) => {
  const clientId = parseInt(req.params.id);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  const db = getDatabase();
  
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
