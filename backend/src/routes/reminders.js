const express = require('express');
const { getUsersWithMissedTimesheets, sendReminders } = require('../services/reminderService');
const { reminderCheckSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/missed', async (req, res, next) => {
  try {
    const lookbackDaysParam = req.query.lookbackDays;
    const lookbackDays = lookbackDaysParam !== undefined ? parseInt(lookbackDaysParam) : 7;
    
    if (isNaN(lookbackDays) || lookbackDays < 1 || lookbackDays > 30) {
      return res.status(400).json({ error: 'lookbackDays must be between 1 and 30' });
    }
    
    const usersWithMissedTimesheets = await getUsersWithMissedTimesheets(lookbackDays);
    
    res.json({
      lookbackDays,
      totalUsers: usersWithMissedTimesheets.length,
      users: usersWithMissedTimesheets
    });
  } catch (error) {
    console.error('Error checking missed timesheets:', error);
    next(error);
  }
});

router.post('/check', async (req, res, next) => {
  try {
    const { error, value } = reminderCheckSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    
    const lookbackDays = value.lookbackDays || 7;
    
    const results = await sendReminders(lookbackDays);
    
    res.json({
      message: 'Reminder check completed',
      lookbackDays,
      ...results
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    next(error);
  }
});

module.exports = router;
