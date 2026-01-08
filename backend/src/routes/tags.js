const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get all tags for the authenticated user
router.get('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;

    db.all(
      'SELECT * FROM tags WHERE user_email = ? ORDER BY name',
      [userEmail],
      (err, rows) => {
        if (err) {
          return next(err);
        }
        res.json({ tags: rows });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Get a single tag
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { id } = req.params;

    db.get(
      'SELECT * FROM tags WHERE id = ? AND user_email = ?',
      [id, userEmail],
      (err, row) => {
        if (err) {
          return next(err);
        }
        if (!row) {
          return res.status(404).json({ error: 'Tag not found' });
        }
        res.json({ tag: row });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Create a new tag
router.post('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    db.run(
      'INSERT INTO tags (name, color, user_email) VALUES (?, ?, ?)',
      [name, color || '#1976d2', userEmail],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Tag with this name already exists' });
          }
          return next(err);
        }
        res.status(201).json({
          message: 'Tag created successfully',
          tag: {
            id: this.lastID,
            name,
            color: color || '#1976d2',
            user_email: userEmail
          }
        });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Update a tag
router.put('/:id', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { id } = req.params;
    const { name, color } = req.body;

    db.get(
      'SELECT * FROM tags WHERE id = ? AND user_email = ?',
      [id, userEmail],
      (err, tag) => {
        if (err) {
          return next(err);
        }
        if (!tag) {
          return res.status(404).json({ error: 'Tag not found' });
        }

        const updates = [];
        const values = [];

        if (name !== undefined) {
          updates.push('name = ?');
          values.push(name);
        }
        if (color !== undefined) {
          updates.push('color = ?');
          values.push(color);
        }

        if (updates.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id, userEmail);

        db.run(
          `UPDATE tags SET ${updates.join(', ')} WHERE id = ? AND user_email = ?`,
          values,
          function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Tag with this name already exists' });
              }
              return next(err);
            }
            res.json({ message: 'Tag updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Delete a tag
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { id } = req.params;

    db.run(
      'DELETE FROM tags WHERE id = ? AND user_email = ?',
      [id, userEmail],
      function(err) {
        if (err) {
          return next(err);
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Tag not found' });
        }
        res.json({ message: 'Tag deleted successfully' });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Get tags for a work entry
router.get('/work-entry/:workEntryId', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { workEntryId } = req.params;

    db.all(
      `SELECT t.* FROM tags t
       JOIN work_entry_tags wet ON t.id = wet.tag_id
       WHERE wet.work_entry_id = ? AND t.user_email = ?`,
      [workEntryId, userEmail],
      (err, rows) => {
        if (err) {
          return next(err);
        }
        res.json({ tags: rows });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Add tags to a work entry
router.post('/work-entry/:workEntryId', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { workEntryId } = req.params;
    const { tagIds } = req.body;

    if (!tagIds || !Array.isArray(tagIds)) {
      return res.status(400).json({ error: 'Tag IDs array is required' });
    }

    // Verify work entry belongs to user
    db.get(
      'SELECT id FROM work_entries WHERE id = ? AND user_email = ?',
      [workEntryId, userEmail],
      (err, entry) => {
        if (err) {
          return next(err);
        }
        if (!entry) {
          return res.status(404).json({ error: 'Work entry not found' });
        }

        // Clear existing tags
        db.run(
          'DELETE FROM work_entry_tags WHERE work_entry_id = ?',
          [workEntryId],
          (err) => {
            if (err) {
              return next(err);
            }

            // Add new tags
            if (tagIds.length === 0) {
              return res.json({ message: 'Tags updated successfully' });
            }

            const placeholders = tagIds.map(() => '(?, ?)').join(', ');
            const values = tagIds.flatMap(tagId => [workEntryId, tagId]);

            db.run(
              `INSERT OR IGNORE INTO work_entry_tags (work_entry_id, tag_id) VALUES ${placeholders}`,
              values,
              function(err) {
                if (err) {
                  return next(err);
                }
                res.json({ message: 'Tags updated successfully' });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
