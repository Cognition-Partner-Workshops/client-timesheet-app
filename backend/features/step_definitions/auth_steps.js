const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

Given('the API is running', async function() {
});

Given('a user exists with email {string}', async function(email) {
  await this.createUserDirectly(email);
});

Given('I am authenticated as {string}', async function(email) {
  await this.createUserDirectly(email);
  this.currentUserEmail = email;
});

When('I login with email {string}', async function(email) {
  await this.makeRequest('POST', '/api/auth/login', { email });
});

When('I request my user info', async function() {
  await this.makeRequest('GET', '/api/auth/me');
});

When('I request my user info without authentication', async function() {
  const savedEmail = this.currentUserEmail;
  this.currentUserEmail = null;
  await this.makeRequest('GET', '/api/auth/me');
  this.currentUserEmail = savedEmail;
});

Then('the response status should be {int}', function(expectedStatus) {
  assert.strictEqual(this.response.status, expectedStatus, 
    `Expected status ${expectedStatus} but got ${this.response.status}. Body: ${JSON.stringify(this.response.body)}`);
});

Then('the response should contain message {string}', function(expectedMessage) {
  assert.strictEqual(this.response.body.message, expectedMessage);
});

Then('the response should contain user email {string}', function(expectedEmail) {
  assert.strictEqual(this.response.body.user.email, expectedEmail);
});

Then('the response should contain error {string}', function(expectedError) {
  assert.strictEqual(this.response.body.error, expectedError);
});
