const { getDatabase } = require('../database/init');

// Authentication middleware supporting both email and mobile number
function authenticateUser(req, res, next) {
  const userEmail = req.headers['x-user-email'];
  const userMobile = req.headers['x-user-mobile'];
  
  if (!userEmail && !userMobile) {
    return res.status(401).json({ error: 'User email or mobile number required in x-user-email or x-user-mobile header' });
  }

  const db = getDatabase();

  if (userEmail) {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists, create if not
    db.get('SELECT email FROM users WHERE email = ?', [userEmail], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        // Create new user
        db.run('INSERT INTO users (email) VALUES (?)', [userEmail], (err) => {
          if (err) {
            console.error('Error creating user:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          req.userEmail = userEmail;
          next();
        });
      } else {
        req.userEmail = userEmail;
        next();
      }
    });
  } else if (userMobile) {
    // Validate mobile number format
    const mobileRegex = /^\+?[1-9]\d{6,14}$/;
    if (!mobileRegex.test(userMobile)) {
      return res.status(400).json({ error: 'Invalid mobile number format' });
    }

    // Check if user exists with this mobile number
    db.get('SELECT email, mobile_number FROM users WHERE mobile_number = ?', [userMobile], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(401).json({ error: 'User not found. Please login first.' });
      } else {
        // Use email if available, otherwise use mobile number as identifier
        req.userEmail = row.email || row.mobile_number;
        req.userMobile = row.mobile_number;
        next();
      }
    });
  }
}

module.exports = {
  authenticateUser
};
