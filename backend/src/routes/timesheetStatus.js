const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateUser);

router.get('/', (req, res) => {
  const { date } = req.query;
  const db = getDatabase();
  
  let targetDate = date;
  
  if (!targetDate) {
    const today = new Date();
    targetDate = today.toISOString().split('T')[0];
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(targetDate)) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }
  
  const startOfDay = new Date(targetDate + 'T00:00:00.000Z').getTime();
  const endOfDay = new Date(targetDate + 'T23:59:59.999Z').getTime();
  
  db.get(
    `SELECT COUNT(*) as count, COALESCE(SUM(hours), 0) as totalHours
     FROM work_entries
     WHERE user_email = ? AND date >= ? AND date <= ?`,
    [req.userEmail, startOfDay, endOfDay],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      const submitted = row && row.count > 0 ? 'yes' : 'no';
      
      res.json({
        submitted,
        date: targetDate,
        totalHours: row ? row.totalHours : 0,
        entriesCount: row ? row.count : 0
      });
    }
  );
});

router.get('/week', (req, res) => {
  const { startDate } = req.query;
  const db = getDatabase();
  
  let weekStart;
  
  if (startDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    weekStart = new Date(startDate + 'T00:00:00.000Z');
  } else {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
  }
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  
  const weekStartTimestamp = weekStart.getTime();
  const weekEndTimestamp = weekEnd.getTime();
  
  db.get(
    `SELECT COUNT(*) as count, COALESCE(SUM(hours), 0) as totalHours
     FROM work_entries
     WHERE user_email = ? AND date >= ? AND date <= ?`,
    [req.userEmail, weekStartTimestamp, weekEndTimestamp],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      const submitted = row && row.count > 0 ? 'yes' : 'no';
      
      res.json({
        submitted,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        totalHours: row ? row.totalHours : 0,
        entriesCount: row ? row.count : 0
      });
    }
  );
});

module.exports = router;
