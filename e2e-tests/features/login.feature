@login
Feature: User Login
  As a user of the Client Timesheet Application
  I want to be able to log in with my email
  So that I can access the time tracking features

  Background:
    Given I am on the login page

  # Positive Scenarios
  @positive @smoke
  Scenario: Successful login with valid email
    When I enter a valid email "testuser@example.com"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see the dashboard header "Dashboard"

  @positive
  Scenario: Login with different valid email formats
    When I enter a valid email "user.name+tag@domain.co.uk"
    And I click the login button
    Then I should be redirected to the dashboard

  @positive
  Scenario: Login page displays correct elements
    Then I should see the page title "Time Tracker"
    And I should see the email input field
    And I should see the login button
    And I should see the info message about no password

  # Negative Scenarios
  @negative
  Scenario: Login button is disabled when email is empty
    Then the login button should be disabled

  @negative
  Scenario: Login with invalid email format
    When I enter an invalid email "invalid-email"
    And I click the login button
    Then I should see an error message

  @negative
  Scenario: Login with empty email after clearing
    When I enter a valid email "test@example.com"
    And I clear the email field
    Then the login button should be disabled

  @negative
  Scenario: Login with email containing only spaces
    When I enter an invalid email "   "
    Then the login button should be disabled
