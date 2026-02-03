@dashboard
Feature: Dashboard
  As a logged-in user
  I want to view the dashboard
  So that I can see an overview of my time tracking data

  Background:
    Given I am logged in as "testuser@example.com"

  # Positive Scenarios
  @positive @smoke
  Scenario: View dashboard with metrics
    Then I should see the dashboard header "Dashboard"
    And I should see the "Total Clients" metric card
    And I should see the "Total Work Entries" metric card
    And I should see the "Total Hours" metric card

  @positive
  Scenario: Dashboard displays correct client count
    Given a client "Dashboard Client 1" exists
    And a client "Dashboard Client 2" exists
    When I navigate to the dashboard
    Then the "Total Clients" metric should show "2"

  @positive
  Scenario: Dashboard displays correct work entries count
    Given a client "Work Client" exists
    And a work entry exists for client "Work Client" with "4" hours
    And a work entry exists for client "Work Client" with "6" hours
    When I navigate to the dashboard
    Then the "Total Work Entries" metric should show "2"

  @positive
  Scenario: Dashboard displays correct total hours
    Given a client "Hours Client" exists
    And a work entry exists for client "Hours Client" with "3.5" hours
    And a work entry exists for client "Hours Client" with "4.5" hours
    When I navigate to the dashboard
    Then the "Total Hours" metric should show "8.00"

  @positive
  Scenario: Navigate to clients page from dashboard
    When I click on the "Total Clients" card
    Then I should be on the clients page

  @positive
  Scenario: Navigate to work entries page from dashboard
    When I click on the "Total Work Entries" card
    Then I should be on the work entries page

  @positive
  Scenario: Navigate to reports page from dashboard
    When I click on the "Total Hours" card
    Then I should be on the reports page

  @positive
  Scenario: View recent work entries on dashboard
    Given a client "Recent Client" exists
    And a work entry exists for client "Recent Client" with "5" hours and description "Recent task"
    When I navigate to the dashboard
    Then I should see the "Recent Work Entries" section
    And I should see "Recent Client" in the recent entries

  @positive
  Scenario: Quick action buttons are visible
    Then I should see the "Add Client" quick action button
    And I should see the "Add Work Entry" quick action button
    And I should see the "View Reports" quick action button

  @positive
  Scenario: Navigate using Add Client quick action
    When I click the "Add Client" quick action button
    Then I should be on the clients page

  @positive
  Scenario: Navigate using Add Work Entry quick action
    When I click the "Add Work Entry" quick action button
    Then I should be on the work entries page

  @positive
  Scenario: Navigate using View Reports quick action
    When I click the "View Reports" quick action button
    Then I should be on the reports page

  @positive
  Scenario: Dashboard shows empty state for new user
    Given no clients exist
    And no work entries exist
    When I navigate to the dashboard
    Then the "Total Clients" metric should show "0"
    And the "Total Work Entries" metric should show "0"
    And the "Total Hours" metric should show "0.00"
    And I should see the message "No work entries yet"

  # Negative Scenarios
  @negative
  Scenario: Unauthenticated user cannot access dashboard
    Given I am not logged in
    When I try to navigate directly to the dashboard
    Then I should be redirected to the login page
