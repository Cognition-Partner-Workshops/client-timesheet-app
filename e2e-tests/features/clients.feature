@clients
Feature: Client Management
  As a logged-in user
  I want to manage my clients
  So that I can track time for different clients

  Background:
    Given I am logged in as "testuser@example.com"
    And I navigate to the clients page

  # Positive Scenarios
  @positive @smoke
  Scenario: View clients page
    Then I should see the clients page header "Clients"
    And I should see the "Add Client" button

  @positive @smoke
  Scenario: Create a new client with required fields only
    When I click the "Add Client" button
    Then I should see the client dialog with title "Add New Client"
    When I enter client name "Test Client ABC"
    And I click the "Create" button in the dialog
    Then I should see the client "Test Client ABC" in the clients table

  @positive
  Scenario: Create a new client with all fields
    When I click the "Add Client" button
    And I enter client name "Full Details Client"
    And I enter client department "Engineering"
    And I enter client email "client@company.com"
    And I enter client description "A client with full details"
    And I click the "Create" button in the dialog
    Then I should see the client "Full Details Client" in the clients table
    And the client "Full Details Client" should have department "Engineering"

  @positive
  Scenario: Edit an existing client
    Given a client "Edit Test Client" exists
    When I click the edit button for client "Edit Test Client"
    Then I should see the client dialog with title "Edit Client"
    When I update the client name to "Updated Client Name"
    And I click the "Update" button in the dialog
    Then I should see the client "Updated Client Name" in the clients table
    And I should not see the client "Edit Test Client" in the clients table

  @positive
  Scenario: Delete a client
    Given a client "Delete Test Client" exists
    When I click the delete button for client "Delete Test Client"
    And I confirm the deletion
    Then I should not see the client "Delete Test Client" in the clients table

  @positive
  Scenario: Cancel client creation
    When I click the "Add Client" button
    And I enter client name "Cancelled Client"
    And I click the "Cancel" button in the dialog
    Then I should not see the client "Cancelled Client" in the clients table

  @positive
  Scenario: View empty clients table message
    Given no clients exist
    Then I should see the message "No clients found. Create your first client to get started."

  # Negative Scenarios
  @negative
  Scenario: Create client without name
    When I click the "Add Client" button
    And I leave the client name empty
    And I click the "Create" button in the dialog
    Then I should see an error message "Client name is required"

  @negative
  Scenario: Create client with only whitespace name
    When I click the "Add Client" button
    And I enter client name "   "
    And I click the "Create" button in the dialog
    Then I should see an error message "Client name is required"

  @negative
  Scenario: Edit client and clear required name
    Given a client "Valid Client" exists
    When I click the edit button for client "Valid Client"
    And I clear the client name field
    And I click the "Update" button in the dialog
    Then I should see an error message "Client name is required"

  @negative
  Scenario: Create client with invalid email format
    When I click the "Add Client" button
    And I enter client name "Invalid Email Client"
    And I enter client email "not-an-email"
    And I click the "Create" button in the dialog
    Then I should see an error message containing "email"
