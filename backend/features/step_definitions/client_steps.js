const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

When('I create a client with name {string} and description {string}', async function(name, description) {
  await this.makeRequest('POST', '/api/clients', { name, description });
  if (this.response.status === 201 && this.response.body.client) {
    this.lastCreatedClientId = this.response.body.client.id;
  }
});

When('I create a client with name {string} and no description', async function(name) {
  await this.makeRequest('POST', '/api/clients', { name });
  if (this.response.status === 201 && this.response.body.client) {
    this.lastCreatedClientId = this.response.body.client.id;
  }
});

Given('I have created a client with name {string}', async function(name) {
  await this.makeRequest('POST', '/api/clients', { name });
  if (this.response.status === 201 && this.response.body.client) {
    this.lastCreatedClientId = this.response.body.client.id;
    if (!this.firstClientId) {
      this.firstClientId = this.lastCreatedClientId;
    }
  }
});

Given('I have created a client with name {string} and description {string}', async function(name, description) {
  await this.makeRequest('POST', '/api/clients', { name, description });
  if (this.response.status === 201 && this.response.body.client) {
    this.lastCreatedClientId = this.response.body.client.id;
    if (!this.firstClientId) {
      this.firstClientId = this.lastCreatedClientId;
    }
  }
});

Given('I have created another client with name {string}', async function(name) {
  await this.makeRequest('POST', '/api/clients', { name });
  if (this.response.status === 201 && this.response.body.client) {
    this.secondClientId = this.response.body.client.id;
  }
});

When('I request all clients', async function() {
  await this.makeRequest('GET', '/api/clients');
});

When('I request the client by ID', async function() {
  await this.makeRequest('GET', `/api/clients/${this.lastCreatedClientId}`);
});

When('I request client with ID {int}', async function(clientId) {
  await this.makeRequest('GET', `/api/clients/${clientId}`);
});

When('I update the client name to {string}', async function(newName) {
  await this.makeRequest('PUT', `/api/clients/${this.lastCreatedClientId}`, { name: newName });
});

When('I update the client description to {string}', async function(newDescription) {
  await this.makeRequest('PUT', `/api/clients/${this.lastCreatedClientId}`, { description: newDescription });
});

When('I delete the client', async function() {
  await this.makeRequest('DELETE', `/api/clients/${this.lastCreatedClientId}`);
});

When('I delete client with ID {int}', async function(clientId) {
  await this.makeRequest('DELETE', `/api/clients/${clientId}`);
});

Given('another user {string} has created a client with name {string}', async function(email, name) {
  this.otherUserClientId = await this.createClientDirectly(email, name);
});

When('I request client with ID of the other user\'s client', async function() {
  await this.makeRequest('GET', `/api/clients/${this.otherUserClientId}`);
});

Then('the response should contain client name {string}', function(expectedName) {
  assert.strictEqual(this.response.body.client.name, expectedName);
});

Then('the response should contain client description {string}', function(expectedDescription) {
  assert.strictEqual(this.response.body.client.description, expectedDescription);
});

Then('the response should contain {int} clients', function(expectedCount) {
  assert.strictEqual(this.response.body.clients.length, expectedCount);
});
