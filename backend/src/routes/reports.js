const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const WORK_ENTRIES_QUERY = `
  SELECT hours, description, date, created_at
  FROM work_entries 
  WHERE client_id = ? AND user_email = ? 
  ORDER BY date DESC
`;

function handleDatabaseError(res, message = 'Internal server error') {
  return (err) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: message });
      return true;
    }
    return false;
  };
}

function verifyClientAndGetData(db, clientId, userEmail, res, callback) {
  db.get(
    'SELECT id, name FROM clients WHERE id = ? AND user_email = ?',
    [clientId, userEmail],
    (err, client) => {
      if (handleDatabaseError(res)(err)) return;
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      db.all(WORK_ENTRIES_QUERY, [clientId, userEmail], (err, workEntries) => {
        if (handleDatabaseError(res)(err)) return;
        callback(client, workEntries);
      });
    }
  );
}

function generateFilename(clientName, extension) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${safeName}_report_${timestamp}.${extension}`;
}

function calculateTotalHours(workEntries) {
  return workEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
}

function ensureTempDirectory(tempPath) {
  const tempDir = path.dirname(tempPath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
}

function generateCsvReport(client, workEntries, res) {
  const filename = generateFilename(client.name, 'csv');
  const tempPath = path.join(__dirname, '../../temp', filename);
  
  ensureTempDirectory(tempPath);
  
  const csvWriter = createCsvWriter({
    path: tempPath,
    header: [
      { id: 'date', title: 'Date' },
      { id: 'hours', title: 'Hours' },
      { id: 'description', title: 'Description' },
      { id: 'created_at', title: 'Created At' }
    ]
  });
  
  csvWriter.writeRecords(workEntries)
    .then(() => {
      res.download(tempPath, filename, (err) => {
        if (err) console.error('Error sending file:', err);
        fs.unlink(tempPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
        });
      });
    })
    .catch((error) => {
      console.error('Error creating CSV:', error);
      res.status(500).json({ error: 'Failed to generate CSV report' });
    });
}

function addPdfWorkEntry(doc, entry, index) {
  const y = doc.y;
  
  if (y > 700) {
    doc.addPage();
  }
  
  doc.text(entry.date, 50, doc.y, { width: 100 });
  doc.text(entry.hours.toString(), 150, y, { width: 80 });
  doc.text(entry.description || 'No description', 230, y, { width: 300 });
  doc.moveDown();
  
  if ((index + 1) % 5 === 0) {
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
  }
}

function generatePdfReport(client, workEntries, res) {
  const doc = new PDFDocument();
  const filename = generateFilename(client.name, 'pdf');
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  doc.pipe(res);
  
  doc.fontSize(20).text(`Time Report for ${client.name}`, { align: 'center' });
  doc.moveDown();
  
  const totalHours = calculateTotalHours(workEntries);
  doc.fontSize(14).text(`Total Hours: ${totalHours.toFixed(2)}`);
  doc.text(`Total Entries: ${workEntries.length}`);
  doc.text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  
  doc.fontSize(12).text('Date', 50, doc.y, { width: 100 });
  doc.text('Hours', 150, doc.y - 15, { width: 80 });
  doc.text('Description', 230, doc.y - 15, { width: 300 });
  doc.moveDown();
  
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
  
  workEntries.forEach((entry, index) => addPdfWorkEntry(doc, entry, index));
  
  doc.end();
}

// All routes require authentication
router.use(authenticateUser);

// Get hourly report for specific client
router.get('/client/:clientId', (req, res) => {
  const clientId = parseInt(req.params.clientId);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  const db = getDatabase();
  
  // Verify client belongs to user
  db.get(
    'SELECT id, name FROM clients WHERE id = ? AND user_email = ?',
    [clientId, req.userEmail],
    (err, client) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      // Get work entries for this client
      db.all(
        `SELECT id, hours, description, date, created_at, updated_at
         FROM work_entries 
         WHERE client_id = ? AND user_email = ? 
         ORDER BY date DESC`,
        [clientId, req.userEmail],
        (err, workEntries) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          // Calculate total hours
          const totalHours = workEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
          
          res.json({
            client: client,
            workEntries: workEntries,
            totalHours: totalHours,
            entryCount: workEntries.length
          });
        }
      );
    }
  );
});

// Export client report as CSV
router.get('/export/csv/:clientId', (req, res) => {
  const clientId = parseInt(req.params.clientId);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  const db = getDatabase();
  
  verifyClientAndGetData(db, clientId, req.userEmail, res, (client, workEntries) => {
    generateCsvReport(client, workEntries, res);
  });
});

// Export client report as PDF
router.get('/export/pdf/:clientId', (req, res) => {
  const clientId = parseInt(req.params.clientId);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  const db = getDatabase();
  
  verifyClientAndGetData(db, clientId, req.userEmail, res, (client, workEntries) => {
    generatePdfReport(client, workEntries, res);
  });
});

module.exports = router;
