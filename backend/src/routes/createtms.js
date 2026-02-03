const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { tmsSchema } = require('../validation/schemas');

const router = express.Router();

router.use(authenticateUser);

router.post('/', (req, res, next) => {
  try {
    const { error, value } = tmsSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { clientId, hours, description, date } = value;
    const db = getDatabase();

    db.get(
      'SELECT id FROM clients WHERE id = ? AND user_email = ?',
      [clientId, req.userEmail],
      (err, client) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!client) {
          return res.status(404).json({ error: 'Client not found' });
        }

        db.run(
          'INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (?, ?, ?, ?, ?)',
          [clientId, req.userEmail, hours, description || null, date],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Failed to create timesheet entry' });
            }

            db.get(
              `SELECT we.id, we.client_id, we.hours, we.description, we.date, we.created_at, we.updated_at, c.name as client_name
               FROM work_entries we
               JOIN clients c ON we.client_id = c.id
               WHERE we.id = ?`,
              [this.lastID],
              (err, row) => {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ error: 'Timesheet entry created but failed to retrieve' });
                }

                res.status(201).json({
                  message: 'Timesheet entry created successfully',
                  entry: row
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

router.get('/', (req, res) => {
  const db = getDatabase();
  const clientId = req.query.clientId ? parseInt(req.query.clientId) : null;

  let query = `
    SELECT we.id, we.client_id, we.hours, we.description, we.date, we.created_at, we.updated_at, c.name as client_name
    FROM work_entries we
    JOIN clients c ON we.client_id = c.id
    WHERE we.user_email = ?
  `;
  const params = [req.userEmail];

  if (clientId) {
    query += ' AND we.client_id = ?';
    params.push(clientId);
  }

  query += ' ORDER BY we.date DESC, we.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ entries: rows });
  });
});

router.get('/:id', (req, res) => {
  const entryId = parseInt(req.params.id);

  if (isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }

  const db = getDatabase();

  db.get(
    `SELECT we.id, we.client_id, we.hours, we.description, we.date, we.created_at, we.updated_at, c.name as client_name
     FROM work_entries we
     JOIN clients c ON we.client_id = c.id
     WHERE we.id = ? AND we.user_email = ?`,
    [entryId, req.userEmail],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Timesheet entry not found' });
      }

      res.json({ entry: row });
    }
  );
});

router.delete('/:id', (req, res) => {
  const entryId = parseInt(req.params.id);

  if (isNaN(entryId)) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }

  const db = getDatabase();

  db.get(
    'SELECT id FROM work_entries WHERE id = ? AND user_email = ?',
    [entryId, req.userEmail],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Timesheet entry not found' });
      }

      db.run(
        'DELETE FROM work_entries WHERE id = ? AND user_email = ?',
        [entryId, req.userEmail],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to delete timesheet entry' });
          }

          res.json({ message: 'Timesheet entry deleted successfully' });
        }
      );
    }
  );
});

module.exports = router;
