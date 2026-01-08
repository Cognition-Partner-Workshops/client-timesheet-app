const { getDatabase } = require('../database/init');
const { sendTimesheetReminderEmail } = require('./emailService');

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getWorkingDays(startDate, endDate) {
  const days = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(formatDate(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

function getUsersWithMissedTimesheets(lookbackDays = 7) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);
    
    const workingDays = getWorkingDays(startDate, endDate);
    
    if (workingDays.length === 0) {
      return resolve([]);
    }
    
    db.all('SELECT email FROM users', [], (err, users) => {
      if (err) {
        console.error('Database error fetching users:', err);
        return reject(err);
      }
      
      if (!users || users.length === 0) {
        return resolve([]);
      }
      
      const usersWithMissedDates = [];
      let processedCount = 0;
      
      users.forEach(user => {
        const placeholders = workingDays.map(() => '?').join(',');
        const query = `
          SELECT DISTINCT date FROM work_entries 
          WHERE user_email = ? AND date IN (${placeholders})
        `;
        
        db.all(query, [user.email, ...workingDays], (err, entries) => {
          processedCount++;
          
          if (err) {
            console.error(`Database error fetching entries for ${user.email}:`, err);
          } else {
            const submittedDates = new Set(entries.map(e => e.date));
            const missedDates = workingDays.filter(day => !submittedDates.has(day));
            
            if (missedDates.length > 0) {
              usersWithMissedDates.push({
                email: user.email,
                missedDates: missedDates.sort()
              });
            }
          }
          
          if (processedCount === users.length) {
            resolve(usersWithMissedDates);
          }
        });
      });
    });
  });
}

async function sendReminders(lookbackDays = 7) {
  const usersWithMissedTimesheets = await getUsersWithMissedTimesheets(lookbackDays);
  
  const results = {
    totalUsers: usersWithMissedTimesheets.length,
    emailsSent: 0,
    emailsFailed: 0,
    details: []
  };
  
  for (const user of usersWithMissedTimesheets) {
    const emailResult = await sendTimesheetReminderEmail(user.email, user.missedDates);
    
    if (emailResult.success) {
      results.emailsSent++;
      results.details.push({
        email: user.email,
        missedDates: user.missedDates,
        status: 'sent',
        messageId: emailResult.messageId
      });
    } else {
      results.emailsFailed++;
      results.details.push({
        email: user.email,
        missedDates: user.missedDates,
        status: 'failed',
        error: emailResult.error
      });
    }
  }
  
  return results;
}

module.exports = {
  getUsersWithMissedTimesheets,
  sendReminders,
  getWorkingDays,
  formatDate
};
