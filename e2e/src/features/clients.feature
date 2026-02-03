@clients
Feature: Client Management
  As a logged-in user
  I want to manage my clients
  So that I can track time for different clients

  Background:
    Given I am logged in as "test@example.com"
    And I am on the clients page

  @positive @smoke
  Scenario: Clients page displays correctly
    Then I should see the clients page title
    And I should see the Add Client button

  @positive
  Scenario: Create a new client with name only
    When I click the Add Client button
    Then I should see the Add New Client dialog
    When I enter client name "Test Client"
    And I click the Create button
    Then the client "Test Client" should appear in the table

  @positive
  Scenario: Create a new client with name and description
    When I click the Add Client button
    And I enter client name "Client With Description"
    And I enter client description "This is a test client description"
    And I click the Create button
    Then the client "Client With Description" should appear in the table

  @positive
  Scenario: Edit an existing client
    Given a client "Original Client" exists
    When I click the edit button for client "Original Client"
    Then I should see the Edit Client dialog
    When I update the client name to "Updated Client"
    And I click the Update button
    Then the client "Updated Client" should appear in the table
    And the client "Original Client" should not appear in the table

  @positive
  Scenario: Delete an existing client
    Given a client "Client To Delete" exists
    When I click the delete button for client "Client To Delete"
    And I confirm the deletion
    Then the client "Client To Delete" should not appear in the table

  @positive
  Scenario: Cancel client creation
    When I click the Add Client button
    And I enter client name "Cancelled Client"
    And I click the Cancel button
    Then the dialog should be closed
    And the client "Cancelled Client" should not appear in the table

  @positive
  Scenario: Cancel client edit
    Given a client "Client To Edit" exists
    When I click the edit button for client "Client To Edit"
    And I update the client name to "Changed Name"
    And I click the Cancel button
    Then the dialog should be closed
    And the client "Client To Edit" should appear in the table

  @negative
  Scenario: Cannot create client without name
    When I click the Add Client button
    And I leave the client name empty
    And I click the Create button
    Then I should see a client name required error

  @negative
  Scenario: Empty clients table shows appropriate message
    Given no clients exist
    Then I should see the no clients found message

  @negative
  Scenario: Create client with very long name
    When I click the Add Client button
    And I enter a client name with 500 characters
    And I click the Create button
    Then the client should be created or show validation error

  @negative
  Scenario: Create client with special characters
    When I click the Add Client button
    And I enter client name "Client <script>alert('xss')</script>"
    And I click the Create button
    Then the client should be created with sanitized name or show error
