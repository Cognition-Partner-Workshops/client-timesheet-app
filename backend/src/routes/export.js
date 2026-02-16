const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const router = express.Router();

// Export work entries to CSV
router.get('/work-entries', authenticateUser, async (req, res, next) => {
  try {
    const db = getDatabase();
    const { format = 'csv', filename = 'work-entries' } = req.query;

    // Get all work entries for the user
    db.all(
      `SELECT we.*, c.name as client_name 
       FROM work_entries we 
       LEFT JOIN clients c ON we.client_id = c.id 
       WHERE we.user_email = ? 
       ORDER BY we.date DESC`,
      [req.userEmail],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Create CSV content
        const csvHeader = 'Date,Client,Hours,Description,Billable\n';
        const csvRows = rows.map(row => 
          `${row.date},"${row.client_name}",${row.hours},"${row.description}",${row.billable}`
        ).join('\n');
        
        const csvContent = csvHeader + csvRows;
        const tempFile = path.join('/tmp', `${filename}.csv`);
        
        fs.writeFileSync(tempFile, csvContent);

        // SECURITY VULNERABILITY: Command injection through unsanitized filename
        // This allows arbitrary command execution if filename contains shell metacharacters
        const command = `cat ${tempFile} | wc -l`;
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Command execution error:', error);
            return res.status(500).json({ error: 'Export failed' });
          }

          const lineCount = parseInt(stdout.trim());
          console.log(`Exported ${lineCount} lines to ${filename}.csv`);

          // Send the file
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
          res.send(csvContent);

          // Clean up temp file
          fs.unlinkSync(tempFile);
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
