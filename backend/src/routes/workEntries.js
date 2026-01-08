const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { workEntrySchema, updateWorkEntrySchema } = require('../validation/schemas');

const router = express.Router();

const WORK_ENTRY_SELECT = `
  SELECT we.id, we.client_id, we.hours, we.description, we.date, 
         we.created_at, we.updated_at, c.name as client_name
  FROM work_entries we
  JOIN clients c ON we.client_id = c.id
`;

function handleDbError(res, err, message = 'Internal server error') {
  console.error('Database error:', err);
  return res.status(500).json({ error: message });
}

function parseWorkEntryId(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid work entry ID' });
    return null;
  }
  return id;
}

function buildWorkEntriesQuery(clientId) {
  let query = `${WORK_ENTRY_SELECT} WHERE we.user_email = ?`;
  if (clientId) query += ' AND we.client_id = ?';
  query += ' ORDER BY we.date DESC, we.created_at DESC';
  return query;
}

router.use(authenticateUser);

router.get('/', (req, res) => {
  const { clientId } = req.query;
  const db = getDatabase();
  const params = [req.userEmail];

  if (clientId) {
    const clientIdNum = parseInt(clientId);
    if (isNaN(clientIdNum)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }
    params.push(clientIdNum);
  }

  const query = buildWorkEntriesQuery(clientId);
  db.all(query, params, (err, rows) => {
    if (err) return handleDbError(res, err);
    res.json({ workEntries: rows });
  });
});

router.get('/:id', (req, res) => {
  const workEntryId = parseWorkEntryId(req, res);
  if (!workEntryId) return;

  const db = getDatabase();
  const query = `${WORK_ENTRY_SELECT} WHERE we.id = ? AND we.user_email = ?`;

  db.get(query, [workEntryId, req.userEmail], (err, row) => {
    if (err) return handleDbError(res, err);
    if (!row) return res.status(404).json({ error: 'Work entry not found' });
    res.json({ workEntry: row });
  });
});

function verifyClientOwnership(db, clientId, userEmail, callback) {
  const query = 'SELECT id FROM clients WHERE id = ? AND user_email = ?';
  db.get(query, [clientId, userEmail], callback);
}

function insertWorkEntry(db, clientId, userEmail, hours, description, date, callback) {
  const query = 'INSERT INTO work_entries (client_id, user_email, hours, description, date) VALUES (?, ?, ?, ?, ?)';
  db.run(query, [clientId, userEmail, hours, description || null, date], callback);
}

function fetchWorkEntryById(db, workEntryId, callback) {
  const query = `${WORK_ENTRY_SELECT} WHERE we.id = ?`;
  db.get(query, [workEntryId], callback);
}

router.post('/', (req, res, next) => {
  const { error, value } = workEntrySchema.validate(req.body);
  if (error) return next(error);

  const { clientId, hours, description, date } = value;
  const db = getDatabase();

  verifyClientOwnership(db, clientId, req.userEmail, (err, row) => {
    if (err) return handleDbError(res, err);
    if (!row) return res.status(400).json({ error: 'Client not found or does not belong to user' });

    insertWorkEntry(db, clientId, req.userEmail, hours, description, date, function(err) {
      if (err) return handleDbError(res, err, 'Failed to create work entry');

      fetchWorkEntryById(db, this.lastID, (err, row) => {
        if (err) return handleDbError(res, err, 'Work entry created but failed to retrieve');
        res.status(201).json({ message: 'Work entry created successfully', workEntry: row });
      });
    });
  });
});

function checkWorkEntryOwnership(db, workEntryId, userEmail, callback) {
  const query = 'SELECT id FROM work_entries WHERE id = ? AND user_email = ?';
  db.get(query, [workEntryId, userEmail], callback);
}

function buildWorkEntryUpdateQuery(value) {
  const updates = [];
  const values = [];

  if (value.clientId !== undefined) {
    updates.push('client_id = ?');
    values.push(value.clientId);
  }
  if (value.hours !== undefined) {
    updates.push('hours = ?');
    values.push(value.hours);
  }
  if (value.description !== undefined) {
    updates.push('description = ?');
    values.push(value.description || null);
  }
  if (value.date !== undefined) {
    updates.push('date = ?');
    values.push(value.date);
  }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  return { updates, values };
}

function executeWorkEntryUpdate(db, workEntryId, userEmail, updates, values, callback) {
  const query = `UPDATE work_entries SET ${updates.join(', ')} WHERE id = ? AND user_email = ?`;
  values.push(workEntryId, userEmail);
  db.run(query, values, callback);
}

function deleteWorkEntryById(db, workEntryId, userEmail, callback) {
  const query = 'DELETE FROM work_entries WHERE id = ? AND user_email = ?';
  db.run(query, [workEntryId, userEmail], callback);
}

router.put('/:id', (req, res, next) => {
  const workEntryId = parseWorkEntryId(req, res);
  if (!workEntryId) return;

  const { error, value } = updateWorkEntrySchema.validate(req.body);
  if (error) return next(error);

  const db = getDatabase();

  checkWorkEntryOwnership(db, workEntryId, req.userEmail, (err, row) => {
    if (err) return handleDbError(res, err);
    if (!row) return res.status(404).json({ error: 'Work entry not found' });

    const performUpdate = () => {
      const { updates, values } = buildWorkEntryUpdateQuery(value);

      executeWorkEntryUpdate(db, workEntryId, req.userEmail, updates, values, function(err) {
        if (err) return handleDbError(res, err, 'Failed to update work entry');

        fetchWorkEntryById(db, workEntryId, (err, row) => {
          if (err) return handleDbError(res, err, 'Work entry updated but failed to retrieve');
          res.json({ message: 'Work entry updated successfully', workEntry: row });
        });
      });
    };

    if (value.clientId) {
      verifyClientOwnership(db, value.clientId, req.userEmail, (err, clientRow) => {
        if (err) return handleDbError(res, err);
        if (!clientRow) return res.status(400).json({ error: 'Client not found or does not belong to user' });
        performUpdate();
      });
    } else {
      performUpdate();
    }
  });
});

router.delete('/:id', (req, res) => {
  const workEntryId = parseWorkEntryId(req, res);
  if (!workEntryId) return;

  const db = getDatabase();

  checkWorkEntryOwnership(db, workEntryId, req.userEmail, (err, row) => {
    if (err) return handleDbError(res, err);
    if (!row) return res.status(404).json({ error: 'Work entry not found' });

    deleteWorkEntryById(db, workEntryId, req.userEmail, function(err) {
      if (err) return handleDbError(res, err, 'Failed to delete work entry');
      res.json({ message: 'Work entry deleted successfully' });
    });
  });
});

module.exports = router;
