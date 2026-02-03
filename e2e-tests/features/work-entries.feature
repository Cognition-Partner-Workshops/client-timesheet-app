@work-entries
Feature: Work Entries Management
  As a logged-in user
  I want to manage my work entries
  So that I can track time spent on client projects

  Background:
    Given I am logged in as "testuser@example.com"
    And a client "Test Client" exists
    And I navigate to the work entries page

  # Positive Scenarios
  @positive @smoke
  Scenario: View work entries page
    Then I should see the work entries page header "Work Entries"
    And I should see the "Add Work Entry" button

  @positive @smoke
  Scenario: Create a new work entry with all fields
    When I click the "Add Work Entry" button
    Then I should see the work entry dialog with title "Add New Work Entry"
    When I select client "Test Client"
    And I enter hours "8"
    And I select today's date
    And I enter work description "Completed feature development"
    And I click the "Create" button in the dialog
    Then I should see a work entry for client "Test Client" with "8" hours in the table

  @positive
  Scenario: Create work entry with minimum hours
    When I click the "Add Work Entry" button
    And I select client "Test Client"
    And I enter hours "0.5"
    And I select today's date
    And I click the "Create" button in the dialog
    Then I should see a work entry for client "Test Client" with "0.5" hours in the table

  @positive
  Scenario: Create work entry with maximum hours
    When I click the "Add Work Entry" button
    And I select client "Test Client"
    And I enter hours "24"
    And I select today's date
    And I click the "Create" button in the dialog
    Then I should see a work entry for client "Test Client" with "24" hours in the table

  @positive
  Scenario: Edit an existing work entry
    Given a work entry exists for client "Test Client" with "4" hours
    When I click the edit button for the work entry
    And I update the hours to "6"
    And I click the "Update" button in the dialog
    Then I should see a work entry for client "Test Client" with "6" hours in the table

  @positive
  Scenario: Delete a work entry
    Given a work entry exists for client "Test Client" with "2" hours
    When I click the delete button for the work entry
    And I confirm the deletion
    Then the work entry should be removed from the table

  @positive
  Scenario: Cancel work entry creation
    When I click the "Add Work Entry" button
    And I select client "Test Client"
    And I enter hours "5"
    And I click the "Cancel" button in the dialog
    Then the dialog should be closed

  @positive
  Scenario: View empty work entries message when no clients exist
    Given no clients exist
    And I navigate to the work entries page
    Then I should see the message "You need to create at least one client before adding work entries."

  @positive
  Scenario: View empty work entries table message
    Given no work entries exist
    Then I should see the message "No work entries found. Add your first work entry to get started."

  # Negative Scenarios
  @negative
  Scenario: Create work entry without selecting client
    When I click the "Add Work Entry" button
    And I enter hours "8"
    And I select today's date
    And I click the "Create" button in the dialog
    Then I should see an error message "Please select a client"

  @negative
  Scenario: Create work entry without hours
    When I click the "Add Work Entry" button
    And I select client "Test Client"
    And I select today's date
    And I click the "Create" button in the dialog
    Then I should see an error message "Hours must be between 0 and 24"

  @negative
  Scenario: Create work entry with zero hours
    When I click the "Add Work Entry" button
    And I select client "Test Client"
    And I enter hours "0"
    And I select today's date
    And I click the "Create" button in the dialog
    Then I should see an error message "Hours must be between 0 and 24"

  @negative
  Scenario: Create work entry with negative hours
    When I click the "Add Work Entry" button
    And I select client "Test Client"
    And I enter hours "-5"
    And I select today's date
    And I click the "Create" button in the dialog
    Then I should see an error message "Hours must be between 0 and 24"

  @negative
  Scenario: Create work entry with hours exceeding 24
    When I click the "Add Work Entry" button
    And I select client "Test Client"
    And I enter hours "25"
    And I select today's date
    And I click the "Create" button in the dialog
    Then I should see an error message "Hours must be between 0 and 24"

  @negative
  Scenario: Create work entry with non-numeric hours
    When I click the "Add Work Entry" button
    And I select client "Test Client"
    And I enter hours "abc"
    And I select today's date
    And I click the "Create" button in the dialog
    Then I should see an error message "Hours must be between 0 and 24"
