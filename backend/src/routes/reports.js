const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const router = express.Router();

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
  
  // Verify client belongs to user and get data
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
      
      // Get work entries
      db.all(
        `SELECT hours, description, date, created_at
         FROM work_entries 
         WHERE client_id = ? AND user_email = ? 
         ORDER BY date DESC`,
        [clientId, req.userEmail],
        (err, workEntries) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          // Create temporary CSV file
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `${client.name.replace(/[^a-zA-Z0-9]/g, '_')}_report_${timestamp}.csv`;
          const tempPath = path.join(__dirname, '../../temp', filename);
          
          // Ensure temp directory exists
          const tempDir = path.dirname(tempPath);
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
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
              // Send file and clean up
              res.download(tempPath, filename, (err) => {
                if (err) {
                  console.error('Error sending file:', err);
                }
                // Clean up temp file
                fs.unlink(tempPath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error('Error deleting temp file:', unlinkErr);
                  }
                });
              });
            })
            .catch((error) => {
              console.error('Error creating CSV:', error);
              res.status(500).json({ error: 'Failed to generate CSV report' });
            });
        }
      );
    }
  );
});

// Export client report as PDF
router.get('/export/pdf/:clientId', (req, res) => {
  const clientId = parseInt(req.params.clientId);
  
  if (isNaN(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID' });
  }
  
  const db = getDatabase();
  
  // Verify client belongs to user and get data
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
      
      // Get work entries
      db.all(
        `SELECT hours, description, date, created_at
         FROM work_entries 
         WHERE client_id = ? AND user_email = ? 
         ORDER BY date DESC`,
        [clientId, req.userEmail],
        (err, workEntries) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
          }
          
          // Create PDF
          const doc = new PDFDocument();
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `${client.name.replace(/[^a-zA-Z0-9]/g, '_')}_report_${timestamp}.pdf`;
          
          // Set response headers
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          
          // Pipe PDF to response
          doc.pipe(res);
          
          // Add content to PDF
          doc.fontSize(20).text(`Time Report for ${client.name}`, { align: 'center' });
          doc.moveDown();
          
          const totalHours = workEntries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);
          doc.fontSize(14).text(`Total Hours: ${totalHours.toFixed(2)}`);
          doc.text(`Total Entries: ${workEntries.length}`);
          doc.text(`Generated: ${new Date().toLocaleString()}`);
          doc.moveDown();
          
          // Add table header
          doc.fontSize(12).text('Date', 50, doc.y, { width: 100 });
          doc.text('Hours', 150, doc.y - 15, { width: 80 });
          doc.text('Description', 230, doc.y - 15, { width: 300 });
          doc.moveDown();
          
          // Add horizontal line
          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown(0.5);
          
          // Add work entries
          workEntries.forEach((entry, index) => {
            const y = doc.y;
            
            // Check if we need a new page
            if (y > 700) {
              doc.addPage();
            }
            
            doc.text(entry.date, 50, doc.y, { width: 100 });
            doc.text(entry.hours.toString(), 150, y, { width: 80 });
            doc.text(entry.description || 'No description', 230, y, { width: 300 });
            doc.moveDown();
            
            // Add separator line every 5 entries
            if ((index + 1) % 5 === 0) {
              doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
              doc.moveDown(0.5);
            }
          });
          
          // Finalize PDF
          doc.end();
        }
      );
    }
  );
});

// Get defaulters report - clients with no recent work entries
router.get('/defaulters', (req, res) => {
  const db = getDatabase();
  const daysThreshold = parseInt(req.query.days) || 7; // Default to 7 days
  
  // Get all clients with their last work entry date and total hours
  db.all(
    `SELECT 
      c.id,
      c.name,
      c.description,
      c.created_at,
      COALESCE(MAX(w.date), c.created_at) as last_entry_date,
      COALESCE(SUM(w.hours), 0) as total_hours,
      COUNT(w.id) as entry_count
    FROM clients c
    LEFT JOIN work_entries w ON c.id = w.client_id AND w.user_email = ?
    WHERE c.user_email = ?
    GROUP BY c.id
    ORDER BY last_entry_date ASC`,
    [req.userEmail, req.userEmail],
    (err, clients) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const defaulters = clients.map(client => {
        const lastEntryDate = new Date(client.last_entry_date);
        lastEntryDate.setHours(0, 0, 0, 0);
        const daysSinceLastEntry = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));
        
        let status = 'ok';
        if (daysSinceLastEntry >= daysThreshold * 2) {
          status = 'critical';
        } else if (daysSinceLastEntry >= daysThreshold) {
          status = 'warning';
        }
        
        return {
          id: client.id,
          name: client.name,
          description: client.description,
          lastEntryDate: client.last_entry_date,
          daysSinceLastEntry,
          totalHours: parseFloat(client.total_hours) || 0,
          entryCount: client.entry_count,
          status
        };
      });
      
      // Filter to only show clients that are defaulters (warning or critical)
      const filteredDefaulters = defaulters.filter(d => d.status !== 'ok');
      
      res.json({
        defaulters: filteredDefaulters,
        allClients: defaulters,
        summary: {
          totalClients: clients.length,
          defaultersCount: filteredDefaulters.length,
          criticalCount: filteredDefaulters.filter(d => d.status === 'critical').length,
          warningCount: filteredDefaulters.filter(d => d.status === 'warning').length,
          daysThreshold
        }
      });
    }
  );
});

// Export defaulters report as CSV
router.get('/defaulters/export/csv', (req, res) => {
  const db = getDatabase();
  const daysThreshold = parseInt(req.query.days) || 7;
  
  db.all(
    `SELECT 
      c.id,
      c.name,
      c.description,
      c.created_at,
      COALESCE(MAX(w.date), c.created_at) as last_entry_date,
      COALESCE(SUM(w.hours), 0) as total_hours,
      COUNT(w.id) as entry_count
    FROM clients c
    LEFT JOIN work_entries w ON c.id = w.client_id AND w.user_email = ?
    WHERE c.user_email = ?
    GROUP BY c.id
    ORDER BY last_entry_date ASC`,
    [req.userEmail, req.userEmail],
    (err, clients) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const defaulters = clients.map(client => {
        const lastEntryDate = new Date(client.last_entry_date);
        lastEntryDate.setHours(0, 0, 0, 0);
        const daysSinceLastEntry = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));
        
        let status = 'ok';
        if (daysSinceLastEntry >= daysThreshold * 2) {
          status = 'critical';
        } else if (daysSinceLastEntry >= daysThreshold) {
          status = 'warning';
        }
        
        return {
          name: client.name,
          description: client.description || '',
          last_entry_date: client.last_entry_date,
          days_since_last_entry: daysSinceLastEntry,
          total_hours: parseFloat(client.total_hours) || 0,
          entry_count: client.entry_count,
          status
        };
      }).filter(d => d.status !== 'ok');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `defaulters_report_${timestamp}.csv`;
      const tempPath = path.join(__dirname, '../../temp', filename);
      
      const tempDir = path.dirname(tempPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const csvWriter = createCsvWriter({
        path: tempPath,
        header: [
          { id: 'name', title: 'Client Name' },
          { id: 'description', title: 'Description' },
          { id: 'last_entry_date', title: 'Last Entry Date' },
          { id: 'days_since_last_entry', title: 'Days Since Last Entry' },
          { id: 'total_hours', title: 'Total Hours' },
          { id: 'entry_count', title: 'Entry Count' },
          { id: 'status', title: 'Status' }
        ]
      });
      
      csvWriter.writeRecords(defaulters)
        .then(() => {
          res.download(tempPath, filename, (err) => {
            if (err) {
              console.error('Error sending file:', err);
            }
            fs.unlink(tempPath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error deleting temp file:', unlinkErr);
              }
            });
          });
        })
        .catch((error) => {
          console.error('Error creating CSV:', error);
          res.status(500).json({ error: 'Failed to generate CSV report' });
        });
    }
  );
});

// Export defaulters report as PDF
router.get('/defaulters/export/pdf', (req, res) => {
  const db = getDatabase();
  const daysThreshold = parseInt(req.query.days) || 7;
  
  db.all(
    `SELECT 
      c.id,
      c.name,
      c.description,
      c.created_at,
      COALESCE(MAX(w.date), c.created_at) as last_entry_date,
      COALESCE(SUM(w.hours), 0) as total_hours,
      COUNT(w.id) as entry_count
    FROM clients c
    LEFT JOIN work_entries w ON c.id = w.client_id AND w.user_email = ?
    WHERE c.user_email = ?
    GROUP BY c.id
    ORDER BY last_entry_date ASC`,
    [req.userEmail, req.userEmail],
    (err, clients) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const defaulters = clients.map(client => {
        const lastEntryDate = new Date(client.last_entry_date);
        lastEntryDate.setHours(0, 0, 0, 0);
        const daysSinceLastEntry = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));
        
        let status = 'ok';
        if (daysSinceLastEntry >= daysThreshold * 2) {
          status = 'critical';
        } else if (daysSinceLastEntry >= daysThreshold) {
          status = 'warning';
        }
        
        return {
          name: client.name,
          description: client.description || '',
          lastEntryDate: client.last_entry_date,
          daysSinceLastEntry,
          totalHours: parseFloat(client.total_hours) || 0,
          entryCount: client.entry_count,
          status
        };
      }).filter(d => d.status !== 'ok');
      
      const doc = new PDFDocument();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `defaulters_report_${timestamp}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      doc.pipe(res);
      
      doc.fontSize(20).text('Defaulters Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(14).text(`Total Defaulters: ${defaulters.length}`);
      doc.text(`Critical: ${defaulters.filter(d => d.status === 'critical').length}`);
      doc.text(`Warning: ${defaulters.filter(d => d.status === 'warning').length}`);
      doc.text(`Days Threshold: ${daysThreshold}`);
      doc.text(`Generated: ${new Date().toLocaleString()}`);
      doc.moveDown();
      
      doc.fontSize(12).text('Client', 50, doc.y, { width: 120 });
      doc.text('Last Entry', 170, doc.y - 15, { width: 80 });
      doc.text('Days', 250, doc.y - 15, { width: 50 });
      doc.text('Hours', 300, doc.y - 15, { width: 50 });
      doc.text('Status', 350, doc.y - 15, { width: 80 });
      doc.moveDown();
      
      doc.moveTo(50, doc.y).lineTo(450, doc.y).stroke();
      doc.moveDown(0.5);
      
      defaulters.forEach((client, index) => {
        const y = doc.y;
        
        if (y > 700) {
          doc.addPage();
        }
        
        doc.text(client.name.substring(0, 20), 50, doc.y, { width: 120 });
        doc.text(client.lastEntryDate, 170, y, { width: 80 });
        doc.text(client.daysSinceLastEntry.toString(), 250, y, { width: 50 });
        doc.text(client.totalHours.toFixed(1), 300, y, { width: 50 });
        doc.text(client.status.toUpperCase(), 350, y, { width: 80 });
        doc.moveDown();
        
        if ((index + 1) % 5 === 0) {
          doc.moveTo(50, doc.y).lineTo(450, doc.y).stroke();
          doc.moveDown(0.5);
        }
      });
      
      doc.end();
    }
  );
});

module.exports = router;
