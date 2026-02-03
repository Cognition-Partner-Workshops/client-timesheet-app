@login
Feature: Login Functionality
  As a user of the Client Timesheet Application
  I want to be able to log in with my email
  So that I can access the application features

  Background:
    Given I am on the login page

  @positive @smoke
  Scenario: Successful login with valid email
    When I enter a valid email "test@example.com"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see the dashboard page

  @positive
  Scenario: Login page displays correct elements
    Then I should see the page title "Time Tracker"
    And I should see the email input field
    And I should see the login button
    And I should see the info alert about no password

  @positive
  Scenario: Login with different valid email formats
    When I enter a valid email "user.name@domain.com"
    And I click the login button
    Then I should be redirected to the dashboard

  @positive
  Scenario: Login with email containing numbers
    When I enter a valid email "user123@example.com"
    And I click the login button
    Then I should be redirected to the dashboard

  @negative
  Scenario: Login button is disabled when email is empty
    When I clear the email input field
    Then the login button should be disabled

  @negative
  Scenario: Login with invalid email format - missing @ symbol
    When I enter an invalid email "invalidemail.com"
    And I click the login button
    Then I should see a validation error

  @negative
  Scenario: Login with invalid email format - missing domain
    When I enter an invalid email "test@"
    And I click the login button
    Then I should see a validation error

  @negative
  Scenario: Login with spaces only
    When I enter an invalid email "   "
    Then the login button should be disabled

  @negative
  Scenario: Unauthenticated user is redirected to login
    Given I am not logged in
    When I try to access the dashboard directly
    Then I should be redirected to the login page
