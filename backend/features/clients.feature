Feature: Client Management
  As an authenticated user
  I want to manage my clients
  So that I can track time for different clients

  Background:
    Given the API is running
    And I am authenticated as "testuser@example.com"

  Scenario: Create a new client
    When I create a client with name "Acme Corp" and description "Software development project"
    Then the response status should be 201
    And the response should contain message "Client created successfully"
    And the response should contain client name "Acme Corp"
    And the response should contain client description "Software development project"

  Scenario: Create a client without description
    When I create a client with name "Beta Inc" and no description
    Then the response status should be 201
    And the response should contain client name "Beta Inc"

  Scenario: Create a client with empty name fails validation
    When I create a client with name "" and description "Some description"
    Then the response status should be 400

  Scenario: Get all clients
    Given I have created a client with name "Client A"
    And I have created a client with name "Client B"
    When I request all clients
    Then the response status should be 200
    And the response should contain 2 clients

  Scenario: Get a specific client by ID
    Given I have created a client with name "Specific Client"
    When I request the client by ID
    Then the response status should be 200
    And the response should contain client name "Specific Client"

  Scenario: Get a non-existent client returns 404
    When I request client with ID 99999
    Then the response status should be 404
    And the response should contain error "Client not found"

  Scenario: Update a client name
    Given I have created a client with name "Old Name"
    When I update the client name to "New Name"
    Then the response status should be 200
    And the response should contain message "Client updated successfully"
    And the response should contain client name "New Name"

  Scenario: Update a client description
    Given I have created a client with name "Test Client" and description "Old description"
    When I update the client description to "New description"
    Then the response status should be 200
    And the response should contain client description "New description"

  Scenario: Delete a client
    Given I have created a client with name "Client to Delete"
    When I delete the client
    Then the response status should be 200
    And the response should contain message "Client deleted successfully"

  Scenario: Delete a non-existent client returns 404
    When I delete client with ID 99999
    Then the response status should be 404

  Scenario: Cannot access another user's client
    Given another user "otheruser@example.com" has created a client with name "Other User Client"
    When I request client with ID of the other user's client
    Then the response status should be 404
