@reports
Feature: Reports
  As a logged-in user
  I want to view and export reports
  So that I can analyze time spent on client projects

  Background:
    Given I am logged in as "testuser@example.com"
    And I navigate to the reports page

  # Positive Scenarios
  @positive @smoke
  Scenario: View reports page
    Then I should see the reports page header "Reports"
    And I should see the client selector dropdown

  @positive @smoke
  Scenario: View report for a client with work entries
    Given a client "Report Client" exists
    And a work entry exists for client "Report Client" with "8" hours
    And a work entry exists for client "Report Client" with "4" hours
    When I select client "Report Client" from the dropdown
    Then I should see the total hours "12.00"
    And I should see the total entries "2"
    And I should see the average hours per entry "6.00"

  @positive
  Scenario: View report with work entries table
    Given a client "Table Client" exists
    And a work entry exists for client "Table Client" with "5" hours and description "Development work"
    When I select client "Table Client" from the dropdown
    Then I should see the work entries table
    And I should see a row with "5" hours and description "Development work"

  @positive
  Scenario: Export report as CSV
    Given a client "CSV Client" exists
    And a work entry exists for client "CSV Client" with "3" hours
    When I select client "CSV Client" from the dropdown
    And I click the CSV export button
    Then a CSV file should be downloaded

  @positive
  Scenario: Export report as PDF
    Given a client "PDF Client" exists
    And a work entry exists for client "PDF Client" with "7" hours
    When I select client "PDF Client" from the dropdown
    And I click the PDF export button
    Then a PDF file should be downloaded

  @positive
  Scenario: View report for client with no work entries
    Given a client "Empty Client" exists
    And no work entries exist for client "Empty Client"
    When I select client "Empty Client" from the dropdown
    Then I should see the total hours "0.00"
    And I should see the total entries "0"
    And I should see the message "No work entries found for this client."

  @positive
  Scenario: Switch between different client reports
    Given a client "Client A" exists
    And a work entry exists for client "Client A" with "10" hours
    And a client "Client B" exists
    And a work entry exists for client "Client B" with "5" hours
    When I select client "Client A" from the dropdown
    Then I should see the total hours "10.00"
    When I select client "Client B" from the dropdown
    Then I should see the total hours "5.00"

  @positive
  Scenario: View prompt to select client when no client is selected
    Then I should see the message "Select a client to view their time report."

  # Negative Scenarios
  @negative
  Scenario: Export buttons disabled when no client selected
    Then the CSV export button should be disabled
    And the PDF export button should be disabled

  @negative
  Scenario: View reports page when no clients exist
    Given no clients exist
    Then I should see the message "You need to create at least one client before generating reports."
    And I should see a "Create Client" button
