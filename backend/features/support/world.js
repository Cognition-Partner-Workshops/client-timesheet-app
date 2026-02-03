const { setWorldConstructor, World } = require('@cucumber/cucumber');
const http = require('http');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.server = null;
    this.baseUrl = null;
    this.response = null;
    this.lastCreatedClientId = null;
    this.lastCreatedWorkEntryId = null;
    this.otherUserClientId = null;
    this.firstClientId = null;
    this.secondClientId = null;
    this.currentUserEmail = null;
  }

  async makeRequest(method, path, body = null, headers = {}) {
    const url = new URL(path, this.baseUrl);
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (this.currentUserEmail) {
      options.headers['x-user-email'] = this.currentUserEmail;
    }

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          this.response = {
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          };
          resolve(this.response);
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async createUserDirectly(email) {
    const { getDatabase } = require('../../src/database/init');
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run('INSERT OR IGNORE INTO users (email) VALUES (?)', [email], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async createClientDirectly(email, name, description = null) {
    const { getDatabase } = require('../../src/database/init');
    const db = getDatabase();
    await this.createUserDirectly(email);
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO clients (name, description, user_email) VALUES (?, ?, ?)',
        [name, description, email],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }
}

setWorldConstructor(CustomWorld);
