const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { clientSchema, updateClientSchema } = require('../validation/schemas');

const router = express.Router();

const CLIENT_FIELDS = 'id, name, description, created_at, updated_at';

function handleDbError(res, err, message = 'Internal server error') {
  console.error('Database error:', err);
  return res.status(500).json({ error: message });
}

function parseClientId(req, res) {
  const clientId = parseInt(req.params.id);
  if (isNaN(clientId)) {
    res.status(400).json({ error: 'Invalid client ID' });
    return null;
  }
  return clientId;
}

router.use(authenticateUser);

router.get('/', (req, res) => {
  const db = getDatabase();
  const query = `SELECT ${CLIENT_FIELDS} FROM clients WHERE user_email = ? ORDER BY name`;
  
  db.all(query, [req.userEmail], (err, rows) => {
    if (err) return handleDbError(res, err);
    res.json({ clients: rows });
  });
});

router.get('/:id', (req, res) => {
  const clientId = parseClientId(req, res);
  if (!clientId) return;
  
  const db = getDatabase();
  const query = `SELECT ${CLIENT_FIELDS} FROM clients WHERE id = ? AND user_email = ?`;
  
  db.get(query, [clientId, req.userEmail], (err, row) => {
    if (err) return handleDbError(res, err);
    if (!row) return res.status(404).json({ error: 'Client not found' });
    res.json({ client: row });
  });
});

function fetchClientById(db, clientId, callback) {
  const query = `SELECT ${CLIENT_FIELDS} FROM clients WHERE id = ?`;
  db.get(query, [clientId], callback);
}

function insertClient(db, name, description, userEmail, callback) {
  const query = 'INSERT INTO clients (name, description, user_email) VALUES (?, ?, ?)';
  db.run(query, [name, description || null, userEmail], callback);
}

router.post('/', (req, res, next) => {
  const { error, value } = clientSchema.validate(req.body);
  if (error) return next(error);

  const { name, description } = value;
  const db = getDatabase();

  insertClient(db, name, description, req.userEmail, function(err) {
    if (err) return handleDbError(res, err, 'Failed to create client');

    fetchClientById(db, this.lastID, (err, row) => {
      if (err) return handleDbError(res, err, 'Client created but failed to retrieve');
      res.status(201).json({ message: 'Client created successfully', client: row });
    });
  });
});

function checkClientOwnership(db, clientId, userEmail, callback) {
  const query = 'SELECT id FROM clients WHERE id = ? AND user_email = ?';
  db.get(query, [clientId, userEmail], callback);
}

function buildUpdateQuery(value) {
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
  updates.push('updated_at = CURRENT_TIMESTAMP');
  return { updates, values };
}

function executeUpdate(db, clientId, userEmail, updates, values, callback) {
  const query = `UPDATE clients SET ${updates.join(', ')} WHERE id = ? AND user_email = ?`;
  values.push(clientId, userEmail);
  db.run(query, values, callback);
}

router.put('/:id', (req, res, next) => {
  const clientId = parseClientId(req, res);
  if (!clientId) return;

  const { error, value } = updateClientSchema.validate(req.body);
  if (error) return next(error);

  const db = getDatabase();

  checkClientOwnership(db, clientId, req.userEmail, (err, row) => {
    if (err) return handleDbError(res, err);
    if (!row) return res.status(404).json({ error: 'Client not found' });

    const { updates, values } = buildUpdateQuery(value);

    executeUpdate(db, clientId, req.userEmail, updates, values, function(err) {
      if (err) return handleDbError(res, err, 'Failed to update client');

      fetchClientById(db, clientId, (err, row) => {
        if (err) return handleDbError(res, err, 'Client updated but failed to retrieve');
        res.json({ message: 'Client updated successfully', client: row });
      });
    });
  });
});

function deleteClientById(db, clientId, userEmail, callback) {
  const query = 'DELETE FROM clients WHERE id = ? AND user_email = ?';
  db.run(query, [clientId, userEmail], callback);
}

router.delete('/:id', (req, res) => {
  const clientId = parseClientId(req, res);
  if (!clientId) return;

  const db = getDatabase();

  checkClientOwnership(db, clientId, req.userEmail, (err, row) => {
    if (err) return handleDbError(res, err);
    if (!row) return res.status(404).json({ error: 'Client not found' });

    deleteClientById(db, clientId, req.userEmail, function(err) {
      if (err) return handleDbError(res, err, 'Failed to delete client');
      res.json({ message: 'Client deleted successfully' });
    });
  });
});

module.exports = router;
