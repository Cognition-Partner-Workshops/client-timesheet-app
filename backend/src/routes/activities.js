const express = require('express');
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');
const { activitySchema, updateActivitySchema } = require('../validation/schemas');

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Get all activities for authenticated user
router.get('/', (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT id, name, description, created_at, updated_at FROM activities WHERE user_email = ? ORDER BY name',
    [req.userEmail],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      res.json({ activities: rows });
    }
  );
});

// Get specific activity
router.get('/:id', (req, res) => {
  const activityId = parseInt(req.params.id);
  
  if (isNaN(activityId)) {
    return res.status(400).json({ error: 'Invalid activity ID' });
  }
  
  const db = getDatabase();
  
  db.get(
    'SELECT id, name, description, created_at, updated_at FROM activities WHERE id = ? AND user_email = ?',
    [activityId, req.userEmail],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      
      res.json({ activity: row });
    }
  );
});

// Create new activity
router.post('/', (req, res, next) => {
  try {
    const { error, value } = activitySchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { name, description } = value;
    const db = getDatabase();

    db.run(
      'INSERT INTO activities (name, description, user_email) VALUES (?, ?, ?)',
      [name, description || null, req.userEmail],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to create activity' });
        }

        // Return the created activity
        db.get(
          'SELECT id, name, description, created_at, updated_at FROM activities WHERE id = ?',
          [this.lastID],
          (err, row) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Activity created but failed to retrieve' });
            }

            res.status(201).json({ 
              message: 'Activity created successfully',
              activity: row 
            });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Update activity
router.put('/:id', (req, res, next) => {
  try {
    const activityId = parseInt(req.params.id);
    
    if (isNaN(activityId)) {
      return res.status(400).json({ error: 'Invalid activity ID' });
    }

    const { error, value } = updateActivitySchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const db = getDatabase();

    // Check if activity exists and belongs to user
    db.get(
      'SELECT id FROM activities WHERE id = ? AND user_email = ?',
      [activityId, req.userEmail],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
          return res.status(404).json({ error: 'Activity not found' });
        }

        // Build update query dynamically
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
        values.push(activityId, req.userEmail);

        const query = `UPDATE activities SET ${updates.join(', ')} WHERE id = ? AND user_email = ?`;

        db.run(query, values, function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to update activity' });
          }

          // Return updated activity
          db.get(
            'SELECT id, name, description, created_at, updated_at FROM activities WHERE id = ?',
            [activityId],
            (err, row) => {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Activity updated but failed to retrieve' });
              }

              res.json({
                message: 'Activity updated successfully',
                activity: row
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

// Delete activity
router.delete('/:id', (req, res) => {
  const activityId = parseInt(req.params.id);
  
  if (isNaN(activityId)) {
    return res.status(400).json({ error: 'Invalid activity ID' });
  }
  
  const db = getDatabase();
  
  // Check if activity exists and belongs to user
  db.get(
    'SELECT id FROM activities WHERE id = ? AND user_email = ?',
    [activityId, req.userEmail],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!row) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      
      // Delete activity (work entries will have activity_id set to NULL due to SET NULL)
      db.run(
        'DELETE FROM activities WHERE id = ? AND user_email = ?',
        [activityId, req.userEmail],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to delete activity' });
          }
          
          res.json({ message: 'Activity deleted successfully' });
        }
      );
    }
  );
});

module.exports = router;
