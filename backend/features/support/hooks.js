const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');

let sharedServer = null;
let sharedBaseUrl = null;

BeforeAll(async function() {
  const express = require('express');
  const { initializeDatabase } = require('../../src/database/init');
  
  await initializeDatabase();

  const app = express();
  app.use(express.json());

  const authRoutes = require('../../src/routes/auth');
  const clientRoutes = require('../../src/routes/clients');
  const workEntryRoutes = require('../../src/routes/workEntries');
  const { errorHandler } = require('../../src/middleware/errorHandler');

  app.use('/api/auth', authRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/work-entries', workEntryRoutes);
  app.use(errorHandler);

  await new Promise((resolve) => {
    sharedServer = app.listen(0, () => {
      const port = sharedServer.address().port;
      sharedBaseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

AfterAll(async function() {
  if (sharedServer) {
    const { closeDatabase } = require('../../src/database/init');
    await new Promise((resolve) => {
      sharedServer.close(() => {
        closeDatabase();
        sharedServer = null;
        resolve();
      });
    });
  }
});

Before(async function() {
  this.baseUrl = sharedBaseUrl;
  this.server = sharedServer;
  
  const { getDatabase } = require('../../src/database/init');
  const db = getDatabase();
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM work_entries', (err) => {
        if (err) reject(err);
      });
      db.run('DELETE FROM clients', (err) => {
        if (err) reject(err);
      });
      db.run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
  
  this.response = null;
  this.lastCreatedClientId = null;
  this.lastCreatedWorkEntryId = null;
  this.otherUserClientId = null;
  this.firstClientId = null;
  this.secondClientId = null;
  this.currentUserEmail = null;
});

After(async function() {
});
