Feature: Work Entry Management
  As an authenticated user
  I want to manage my work entries
  So that I can track time spent on client projects

  Background:
    Given the API is running
    And I am authenticated as "testuser@example.com"
    And I have created a client with name "Test Client"

  Scenario: Create a new work entry
    When I create a work entry with 8 hours on "2024-01-15" with description "Development work"
    Then the response status should be 201
    And the response should contain message "Work entry created successfully"
    And the response should contain work entry hours 8
    And the response should contain work entry date "2024-01-15"
    And the response should contain work entry description "Development work"

  Scenario: Create a work entry without description
    When I create a work entry with 4 hours on "2024-01-16" without description
    Then the response status should be 201
    And the response should contain work entry hours 4

  Scenario: Create a work entry with invalid hours fails validation
    When I create a work entry with 25 hours on "2024-01-15" with description "Too many hours"
    Then the response status should be 400

  Scenario: Create a work entry with zero hours fails validation
    When I create a work entry with 0 hours on "2024-01-15" with description "No hours"
    Then the response status should be 400

  Scenario: Create a work entry for non-existent client fails
    When I create a work entry for client ID 99999 with 8 hours on "2024-01-15"
    Then the response status should be 400
    And the response should contain error "Client not found or does not belong to user"

  Scenario: Get all work entries
    Given I have created a work entry with 4 hours on "2024-01-15"
    And I have created a work entry with 6 hours on "2024-01-16"
    When I request all work entries
    Then the response status should be 200
    And the response should contain 2 work entries

  Scenario: Get work entries filtered by client
    Given I have created another client with name "Another Client"
    And I have created a work entry with 4 hours on "2024-01-15" for the first client
    And I have created a work entry with 6 hours on "2024-01-16" for the second client
    When I request work entries for the first client
    Then the response status should be 200
    And the response should contain 1 work entries

  Scenario: Get a specific work entry by ID
    Given I have created a work entry with 5 hours on "2024-01-15" with description "Specific entry"
    When I request the work entry by ID
    Then the response status should be 200
    And the response should contain work entry hours 5
    And the response should contain work entry description "Specific entry"

  Scenario: Get a non-existent work entry returns 404
    When I request work entry with ID 99999
    Then the response status should be 404
    And the response should contain error "Work entry not found"

  Scenario: Update work entry hours
    Given I have created a work entry with 4 hours on "2024-01-15"
    When I update the work entry hours to 6
    Then the response status should be 200
    And the response should contain message "Work entry updated successfully"
    And the response should contain work entry hours 6

  Scenario: Update work entry date
    Given I have created a work entry with 4 hours on "2024-01-15"
    When I update the work entry date to "2024-01-20"
    Then the response status should be 200
    And the response should contain work entry date "2024-01-20"

  Scenario: Delete a work entry
    Given I have created a work entry with 4 hours on "2024-01-15"
    When I delete the work entry
    Then the response status should be 200
    And the response should contain message "Work entry deleted successfully"

  Scenario: Delete a non-existent work entry returns 404
    When I delete work entry with ID 99999
    Then the response status should be 404
