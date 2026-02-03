const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { leaveSchema, updateLeaveSchema } = require('../validation/schemas');

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get all leaves for authenticated user
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT id, description, start_date, end_date, created_at, updated_at FROM leaves WHERE user_email = ? ORDER BY start_date DESC',
    [req.userEmail],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json({ leaves: rows });
    }
  );
});

// Get specific leave
router.get('/:id', (req, res) => {
  const leaveId = parseInt(req.params.id);
  
  if (isNaN(leaveId)) {
    return res.status(400).json({ error: 'Invalid leave ID' });
  }
  
  const db = getDatabase();
  
  db.get(
    'SELECT id, description, start_date, end_date, created_at, updated_at FROM leaves WHERE id = ? AND user_email = ?',
    [leaveId, req.userEmail],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Leave not found' });
      }
      
      res.json({ leave: row });
    }
  );
});

// Create new leave
router.post('/', (req, res, next) => {
  try {
    const { error, value } = leaveSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { description, start_date, end_date } = value;
    
    // Validate that end_date is not before start_date
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'End date cannot be before start date' });
    }
    
    const db = getDatabase();

    db.run(
      'INSERT INTO leaves (description, start_date, end_date, user_email) VALUES (?, ?, ?, ?)',
      [description, start_date, end_date, req.userEmail],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create leave' });
        }

        // Return the created leave
        db.get(
          'SELECT id, description, start_date, end_date, created_at, updated_at FROM leaves WHERE id = ?',
          [this.lastID],
          (err, row) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Leave created but failed to retrieve' });
            }

            res.status(201).json({ 
              message: 'Leave created successfully',
              leave: row 
            });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Update leave
router.put('/:id', (req, res, next) => {
  try {
    const leaveId = parseInt(req.params.id);
    
    if (isNaN(leaveId)) {
      return res.status(400).json({ error: 'Invalid leave ID' });
    }

    const { error, value } = updateLeaveSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const db = getDatabase();

    // Check if leave exists and belongs to user
    db.get(
      'SELECT id, start_date, end_date FROM leaves WHERE id = ? AND user_email = ?',
      [leaveId, req.userEmail],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
          return res.status(404).json({ error: 'Leave not found' });
        }

        // Validate dates if both are being updated or one is being updated
        const newStartDate = value.start_date || row.start_date;
        const newEndDate = value.end_date || row.end_date;
        
        if (new Date(newEndDate) < new Date(newStartDate)) {
          return res.status(400).json({ error: 'End date cannot be before start date' });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (value.description !== undefined) {
          updates.push('description = ?');
          values.push(value.description);
        }

        if (value.start_date !== undefined) {
          updates.push('start_date = ?');
          values.push(value.start_date);
        }

        if (value.end_date !== undefined) {
          updates.push('end_date = ?');
          values.push(value.end_date);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(leaveId, req.userEmail);

        const query = `UPDATE leaves SET ${updates.join(', ')} WHERE id = ? AND user_email = ?`;

        db.run(query, values, function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update leave' });
          }

          // Return updated leave
          db.get(
            'SELECT id, description, start_date, end_date, created_at, updated_at FROM leaves WHERE id = ?',
            [leaveId],
            (err, row) => {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Leave updated but failed to retrieve' });
              }

              res.json({
                message: 'Leave updated successfully',
                leave: row
              });
            }
          );
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Delete leave
router.delete('/:id', (req, res) => {
  const leaveId = parseInt(req.params.id);
  
  if (isNaN(leaveId)) {
    return res.status(400).json({ error: 'Invalid leave ID' });
  }
  
  const db = getDatabase();
  
  // Check if leave exists and belongs to user
  db.get(
    'SELECT id FROM leaves WHERE id = ? AND user_email = ?',
    [leaveId, req.userEmail],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Leave not found' });
      }
      
      // Delete leave
      db.run(
        'DELETE FROM leaves WHERE id = ? AND user_email = ?',
        [leaveId, req.userEmail],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to delete leave' });
          }
          
          res.json({ message: 'Leave deleted successfully' });
        }
      );
    }
  );
});

module.exports = router;
