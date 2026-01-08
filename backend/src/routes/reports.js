const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const router = express.Router();

function handleDbError(res, err) {
  console.error('Database error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}

function parseClientId(req, res) {
  const clientId = parseInt(req.params.clientId);
  if (isNaN(clientId)) {
    res.status(400).json({ error: 'Invalid client ID' });
    return null;
  }
  return clientId;
}

function fetchClientByIdAndUser(db, clientId, userEmail, callback) {
  const query = 'SELECT id, name FROM clients WHERE id = ? AND user_email = ?';
  db.get(query, [clientId, userEmail], callback);
}

function fetchWorkEntriesForClient(db, clientId, userEmail, callback) {
  const query = `SELECT id, hours, description, date, created_at, updated_at
    FROM work_entries WHERE client_id = ? AND user_email = ? ORDER BY date DESC`;
  db.get(query, [clientId, userEmail], callback);
}

function fetchWorkEntriesForExport(db, clientId, userEmail, callback) {
  const query = `SELECT hours, description, date, created_at
    FROM work_entries WHERE client_id = ? AND user_email = ? ORDER BY date DESC`;
  db.all(query, [clientId, userEmail], callback);
}

function calculateTotalHours(workEntries) {
  return workEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
}

router.use(authenticateUser);

router.get('/client/:clientId', (req, res) => {
  const clientId = parseClientId(req, res);
  if (!clientId) return;

  const db = getDatabase();

  fetchClientByIdAndUser(db, clientId, req.userEmail, (err, client) => {
    if (err) return handleDbError(res, err);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const query = `SELECT id, hours, description, date, created_at, updated_at
      FROM work_entries WHERE client_id = ? AND user_email = ? ORDER BY date DESC`;

    db.all(query, [clientId, req.userEmail], (err, workEntries) => {
      if (err) return handleDbError(res, err);

      const totalHours = calculateTotalHours(workEntries);
      res.json({
        client: client,
        workEntries: workEntries,
        totalHours: totalHours,
        entryCount: workEntries.length
      });
    });
  });
});

function generateFilename(clientName, extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${safeName}_report_${timestamp}.${extension}`;
}

function ensureTempDirectory(tempPath) {
  const tempDir = path.dirname(tempPath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
}

function createCsvWriterConfig(tempPath) {
  return createCsvWriter({
    path: tempPath,
    header: [
      { id: 'date', title: 'Date' },
      { id: 'hours', title: 'Hours' },
      { id: 'description', title: 'Description' },
      { id: 'created_at', title: 'Created At' }
    ]
  });
}

function cleanupTempFile(tempPath) {
  fs.unlink(tempPath, (unlinkErr) => {
    if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
  });
}

router.get('/export/csv/:clientId', (req, res) => {
  const clientId = parseClientId(req, res);
  if (!clientId) return;

  const db = getDatabase();

  fetchClientByIdAndUser(db, clientId, req.userEmail, (err, client) => {
    if (err) return handleDbError(res, err);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    fetchWorkEntriesForExport(db, clientId, req.userEmail, (err, workEntries) => {
      if (err) return handleDbError(res, err);

      const filename = generateFilename(client.name, 'csv');
      const tempPath = path.join(__dirname, '../../temp', filename);

      ensureTempDirectory(tempPath);

      const csvWriter = createCsvWriterConfig(tempPath);

      csvWriter.writeRecords(workEntries)
        .then(() => {
          res.download(tempPath, filename, (err) => {
            if (err) console.error('Error sending file:', err);
            cleanupTempFile(tempPath);
          });
        })
        .catch((error) => {
          console.error('Error creating CSV:', error);
          res.status(500).json({ error: 'Failed to generate CSV report' });
        });
    });
  });
});

function setPdfResponseHeaders(res, filename) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
}

function addPdfHeader(doc, clientName, workEntries) {
  doc.fontSize(20).text(`Time Report for ${clientName}`, { align: 'center' });
  doc.moveDown();

  const totalHours = calculateTotalHours(workEntries);
  doc.fontSize(14).text(`Total Hours: ${totalHours.toFixed(2)}`);
  doc.text(`Total Entries: ${workEntries.length}`);
  doc.text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
}

function addPdfTableHeader(doc) {
  doc.fontSize(12).text('Date', 50, doc.y, { width: 100 });
  doc.text('Hours', 150, doc.y - 15, { width: 80 });
  doc.text('Description', 230, doc.y - 15, { width: 300 });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
}

function addPdfWorkEntry(doc, entry, index) {
  const y = doc.y;
  if (y > 700) doc.addPage();

  doc.text(entry.date, 50, doc.y, { width: 100 });
  doc.text(entry.hours.toString(), 150, y, { width: 80 });
  doc.text(entry.description || 'No description', 230, y, { width: 300 });
  doc.moveDown();

  if ((index + 1) % 5 === 0) {
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
  }
}

router.get('/export/pdf/:clientId', (req, res) => {
  const clientId = parseClientId(req, res);
  if (!clientId) return;

  const db = getDatabase();

  fetchClientByIdAndUser(db, clientId, req.userEmail, (err, client) => {
    if (err) return handleDbError(res, err);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    fetchWorkEntriesForExport(db, clientId, req.userEmail, (err, workEntries) => {
      if (err) return handleDbError(res, err);

      const doc = new PDFDocument();
      const filename = generateFilename(client.name, 'pdf');

      setPdfResponseHeaders(res, filename);
      doc.pipe(res);

      addPdfHeader(doc, client.name, workEntries);
      addPdfTableHeader(doc);
      workEntries.forEach((entry, index) => addPdfWorkEntry(doc, entry, index));

      doc.end();
    });
  });
});

module.exports = router;
