const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get active timer for the authenticated user
router.get('/active', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;

    db.get(
      `SELECT ts.*, c.name as client_name, p.name as project_name
       FROM timer_sessions ts
       LEFT JOIN clients c ON ts.client_id = c.id
       LEFT JOIN projects p ON ts.project_id = p.id
       WHERE ts.user_email = ? AND ts.is_active = 1`,
      [userEmail],
      (err, row) => {
        if (err) {
          return next(err);
        }
        res.json({ timer: row || null });
      }
    );
  } catch (error) {
    next(error);
  }
});

// Start a new timer
router.post('/start', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { clientId, projectId, description } = req.body;

    // Check if there's already an active timer
    db.get(
      'SELECT id FROM timer_sessions WHERE user_email = ? AND is_active = 1',
      [userEmail],
      (err, existingTimer) => {
        if (err) {
          return next(err);
        }
        if (existingTimer) {
          return res.status(400).json({ error: 'A timer is already running. Stop it first.' });
        }

        const startTime = new Date().toISOString();

        db.run(
          `INSERT INTO timer_sessions (user_email, client_id, project_id, description, start_time, is_active)
           VALUES (?, ?, ?, ?, ?, 1)`,
          [userEmail, clientId || null, projectId || null, description || null, startTime],
          function(err) {
            if (err) {
              return next(err);
            }
            res.status(201).json({
              message: 'Timer started',
              timer: {
                id: this.lastID,
                user_email: userEmail,
                client_id: clientId || null,
                project_id: projectId || null,
                description: description || null,
                start_time: startTime,
                is_active: true
              }
            });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Stop the active timer and optionally create a work entry
router.post('/stop', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { createWorkEntry, clientId, projectId, description, isBillable } = req.body;

    db.get(
      'SELECT * FROM timer_sessions WHERE user_email = ? AND is_active = 1',
      [userEmail],
      (err, timer) => {
        if (err) {
          return next(err);
        }
        if (!timer) {
          return res.status(404).json({ error: 'No active timer found' });
        }

        const endTime = new Date();
        const startTime = new Date(timer.start_time);
        const durationMs = endTime - startTime;
        const hours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places

        // Deactivate the timer
        db.run(
          'UPDATE timer_sessions SET is_active = 0 WHERE id = ?',
          [timer.id],
          function(err) {
            if (err) {
              return next(err);
            }

            // If createWorkEntry is true and we have a client, create a work entry
            if (createWorkEntry && (clientId || timer.client_id)) {
              const finalClientId = clientId || timer.client_id;
              const finalProjectId = projectId || timer.project_id;
              const finalDescription = description || timer.description;
              const date = endTime.toISOString().split('T')[0];

              db.run(
                `INSERT INTO work_entries (client_id, project_id, user_email, hours, description, date, is_billable)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [finalClientId, finalProjectId, userEmail, hours, finalDescription, date, isBillable !== false ? 1 : 0],
                function(err) {
                  if (err) {
                    return next(err);
                  }
                  res.json({
                    message: 'Timer stopped and work entry created',
                    duration: {
                      hours,
                      milliseconds: durationMs
                    },
                    workEntry: {
                      id: this.lastID,
                      client_id: finalClientId,
                      project_id: finalProjectId,
                      hours,
                      description: finalDescription,
                      date,
                      is_billable: isBillable !== false
                    }
                  });
                }
              );
            } else {
              res.json({
                message: 'Timer stopped',
                duration: {
                  hours,
                  milliseconds: durationMs
                }
              });
            }
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Update the active timer (change client, project, or description)
router.put('/update', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;
    const { clientId, projectId, description } = req.body;

    db.get(
      'SELECT * FROM timer_sessions WHERE user_email = ? AND is_active = 1',
      [userEmail],
      (err, timer) => {
        if (err) {
          return next(err);
        }
        if (!timer) {
          return res.status(404).json({ error: 'No active timer found' });
        }

        const updates = [];
        const values = [];

        if (clientId !== undefined) {
          updates.push('client_id = ?');
          values.push(clientId);
        }
        if (projectId !== undefined) {
          updates.push('project_id = ?');
          values.push(projectId);
        }
        if (description !== undefined) {
          updates.push('description = ?');
          values.push(description);
        }

        if (updates.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(timer.id);

        db.run(
          `UPDATE timer_sessions SET ${updates.join(', ')} WHERE id = ?`,
          values,
          function(err) {
            if (err) {
              return next(err);
            }
            res.json({ message: 'Timer updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
});

// Discard the active timer without creating a work entry
router.delete('/discard', async (req, res, next) => {
  try {
    const db = getDatabase();
    const userEmail = req.userEmail;

    db.run(
      'DELETE FROM timer_sessions WHERE user_email = ? AND is_active = 1',
      [userEmail],
      function(err) {
        if (err) {
          return next(err);
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'No active timer found' });
        }
        res.json({ message: 'Timer discarded' });
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
