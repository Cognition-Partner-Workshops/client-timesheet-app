const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

When('I create a work entry with {int} hours on {string} with description {string}', async function(hours, date, description) {
  await this.makeRequest('POST', '/api/work-entries', {
    clientId: this.lastCreatedClientId,
    hours,
    date,
    description
  });
  if (this.response.status === 201 && this.response.body.workEntry) {
    this.lastCreatedWorkEntryId = this.response.body.workEntry.id;
  }
});

When('I create a work entry with {int} hours on {string} without description', async function(hours, date) {
  await this.makeRequest('POST', '/api/work-entries', {
    clientId: this.lastCreatedClientId,
    hours,
    date
  });
  if (this.response.status === 201 && this.response.body.workEntry) {
    this.lastCreatedWorkEntryId = this.response.body.workEntry.id;
  }
});

When('I create a work entry for client ID {int} with {int} hours on {string}', async function(clientId, hours, date) {
  await this.makeRequest('POST', '/api/work-entries', {
    clientId,
    hours,
    date
  });
});

Given('I have created a work entry with {int} hours on {string}', async function(hours, date) {
  await this.makeRequest('POST', '/api/work-entries', {
    clientId: this.lastCreatedClientId || this.firstClientId,
    hours,
    date
  });
  if (this.response.status === 201 && this.response.body.workEntry) {
    this.lastCreatedWorkEntryId = this.response.body.workEntry.id;
  }
});

Given('I have created a work entry with {int} hours on {string} with description {string}', async function(hours, date, description) {
  await this.makeRequest('POST', '/api/work-entries', {
    clientId: this.lastCreatedClientId || this.firstClientId,
    hours,
    date,
    description
  });
  if (this.response.status === 201 && this.response.body.workEntry) {
    this.lastCreatedWorkEntryId = this.response.body.workEntry.id;
  }
});

Given('I have created a work entry with {int} hours on {string} for the first client', async function(hours, date) {
  await this.makeRequest('POST', '/api/work-entries', {
    clientId: this.firstClientId,
    hours,
    date
  });
  if (this.response.status === 201 && this.response.body.workEntry) {
    this.lastCreatedWorkEntryId = this.response.body.workEntry.id;
  }
});

Given('I have created a work entry with {int} hours on {string} for the second client', async function(hours, date) {
  await this.makeRequest('POST', '/api/work-entries', {
    clientId: this.secondClientId,
    hours,
    date
  });
});

When('I request all work entries', async function() {
  await this.makeRequest('GET', '/api/work-entries');
});

When('I request work entries for the first client', async function() {
  await this.makeRequest('GET', `/api/work-entries?clientId=${this.firstClientId}`);
});

When('I request the work entry by ID', async function() {
  await this.makeRequest('GET', `/api/work-entries/${this.lastCreatedWorkEntryId}`);
});

When('I request work entry with ID {int}', async function(workEntryId) {
  await this.makeRequest('GET', `/api/work-entries/${workEntryId}`);
});

When('I update the work entry hours to {int}', async function(newHours) {
  await this.makeRequest('PUT', `/api/work-entries/${this.lastCreatedWorkEntryId}`, { hours: newHours });
});

When('I update the work entry date to {string}', async function(newDate) {
  await this.makeRequest('PUT', `/api/work-entries/${this.lastCreatedWorkEntryId}`, { date: newDate });
});

When('I delete the work entry', async function() {
  await this.makeRequest('DELETE', `/api/work-entries/${this.lastCreatedWorkEntryId}`);
});

When('I delete work entry with ID {int}', async function(workEntryId) {
  await this.makeRequest('DELETE', `/api/work-entries/${workEntryId}`);
});

Then('the response should contain work entry hours {int}', function(expectedHours) {
  const workEntry = this.response.body.workEntry;
  assert.strictEqual(workEntry.hours, expectedHours);
});

Then('the response should contain work entry date {string}', function(expectedDate) {
  const workEntry = this.response.body.workEntry;
  const actualDate = typeof workEntry.date === 'number' 
    ? new Date(workEntry.date).toISOString().split('T')[0]
    : workEntry.date;
  assert.strictEqual(actualDate, expectedDate);
});

Then('the response should contain work entry description {string}', function(expectedDescription) {
  const workEntry = this.response.body.workEntry;
  assert.strictEqual(workEntry.description, expectedDescription);
});

Then('the response should contain {int} work entries', function(expectedCount) {
  assert.strictEqual(this.response.body.workEntries.length, expectedCount);
});
