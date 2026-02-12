// This file contains intentional security vulnerabilities for testing

const { exec } = require('child_process');
const fs = require('fs');

// VULNERABILITY: Command Injection - user input passed directly to exec
function runUserCommand(userInput) {
  exec('ls ' + userInput, (error, stdout, stderr) => {
    console.log(stdout);
  });
}

// VULNERABILITY: Path Traversal - no sanitization of file path
function readUserFile(filename) {
  const content = fs.readFileSync('/data/' + filename, 'utf8');
  return content;
}

// VULNERABILITY: SQL Injection simulation (even though we use SQLite, this pattern is dangerous)
function unsafeQuery(db, userInput) {
  const query = "SELECT * FROM users WHERE name = '" + userInput + "'";
  return db.exec(query);
}

// VULNERABILITY: Hardcoded credentials
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'admin123';

module.exports = {
  runUserCommand,
  readUserFile,
  unsafeQuery,
  API_KEY,
  DB_PASSWORD
};
