Feature: Authentication
  As a user of the timesheet application
  I want to be able to authenticate
  So that I can access my timesheet data

  Scenario: Login with a new email creates a new user
    Given the API is running
    When I login with email "newuser@example.com"
    Then the response status should be 201
    And the response should contain message "User created and logged in successfully"
    And the response should contain user email "newuser@example.com"

  Scenario: Login with an existing email returns the user
    Given the API is running
    And a user exists with email "existinguser@example.com"
    When I login with email "existinguser@example.com"
    Then the response status should be 200
    And the response should contain message "Login successful"
    And the response should contain user email "existinguser@example.com"

  Scenario: Login with invalid email format fails validation
    Given the API is running
    When I login with email "invalid-email"
    Then the response status should be 400

  Scenario: Get current user info when authenticated
    Given the API is running
    And I am authenticated as "testuser@example.com"
    When I request my user info
    Then the response status should be 200
    And the response should contain user email "testuser@example.com"

  Scenario: Get current user info without authentication fails
    Given the API is running
    When I request my user info without authentication
    Then the response status should be 401
