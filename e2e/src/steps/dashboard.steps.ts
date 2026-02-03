import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ClientsPage } from '../pages/ClientsPage';
import { WorkEntriesPage } from '../pages/WorkEntriesPage';
import { ReportsPage } from '../pages/ReportsPage';

let loginPage: LoginPage;
let dashboardPage: DashboardPage;
let clientsPage: ClientsPage;
let workEntriesPage: WorkEntriesPage;
let reportsPage: ReportsPage;

Given('I am logged in as {string}', async function (this: PlaywrightWorld, email: string) {
  loginPage = new LoginPage(this.page!);
  dashboardPage = new DashboardPage(this.page!);
  clientsPage = new ClientsPage(this.page!);
  workEntriesPage = new WorkEntriesPage(this.page!);
  reportsPage = new ReportsPage(this.page!);
  
  await loginPage.navigateToLogin();
  await loginPage.login(email);
  this.testData.userEmail = email;
});

Given('I am on the dashboard page', async function (this: PlaywrightWorld) {
  dashboardPage = new DashboardPage(this.page!);
  await dashboardPage.navigateToDashboard();
  await dashboardPage.waitForDashboardToLoad();
});

Then('I should see the dashboard title', async function (this: PlaywrightWorld) {
  const isDashboard = await dashboardPage.isDashboardDisplayed();
  expect(isDashboard).toBe(true);
});

Then('I should see the Total Clients card', async function (this: PlaywrightWorld) {
  const isVisible = await dashboardPage.isTotalClientsCardVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the Total Work Entries card', async function (this: PlaywrightWorld) {
  const isVisible = await dashboardPage.isTotalWorkEntriesCardVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the dashboard Total Hours card', async function (this: PlaywrightWorld) {
  const isVisible = await dashboardPage.isTotalHoursCardVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the Recent Work Entries section', async function (this: PlaywrightWorld) {
  const isVisible = await dashboardPage.isRecentWorkEntriesVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the Quick Actions section', async function (this: PlaywrightWorld) {
  const isVisible = await dashboardPage.isQuickActionsVisible();
  expect(isVisible).toBe(true);
});

Then('the Total Clients value should be {string}', async function (this: PlaywrightWorld, expectedValue: string) {
  const value = await dashboardPage.getTotalClientsValue();
  expect(value).toBe(expectedValue);
});

Then('the Total Work Entries value should be {string}', async function (this: PlaywrightWorld, expectedValue: string) {
  const value = await dashboardPage.getTotalWorkEntriesValue();
  expect(value).toBe(expectedValue);
});

Then('the Total Hours value should be {string}', async function (this: PlaywrightWorld, expectedValue: string) {
  const value = await dashboardPage.getTotalHoursValue();
  expect(value).toBe(expectedValue);
});

When('I click the Add Client quick action button', async function (this: PlaywrightWorld) {
  await dashboardPage.clickAddClientButton();
});

When('I click the Add Work Entry quick action button', async function (this: PlaywrightWorld) {
  await dashboardPage.clickAddWorkEntryButton();
});

When('I click the View Reports quick action button', async function (this: PlaywrightWorld) {
  await dashboardPage.clickViewReportsButton();
});

When('I click the Add Entry button in Recent Work Entries', async function (this: PlaywrightWorld) {
  await dashboardPage.clickAddEntryButton();
});

When('I click on the Total Clients card', async function (this: PlaywrightWorld) {
  await this.page!.click('.MuiCard-root:has-text("Total Clients")');
  await this.page!.waitForLoadState('networkidle');
});

When('I click on the Total Work Entries card', async function (this: PlaywrightWorld) {
  await this.page!.click('.MuiCard-root:has-text("Total Work Entries")');
  await this.page!.waitForLoadState('networkidle');
});

When('I click on the Total Hours card', async function (this: PlaywrightWorld) {
  await this.page!.click('.MuiCard-root:has-text("Total Hours")');
  await this.page!.waitForLoadState('networkidle');
});

Then('I should be on the clients page', async function (this: PlaywrightWorld) {
  clientsPage = new ClientsPage(this.page!);
  const isOnPage = await clientsPage.isOnClientsPage();
  expect(isOnPage).toBe(true);
});

Then('I should be on the work entries page', async function (this: PlaywrightWorld) {
  workEntriesPage = new WorkEntriesPage(this.page!);
  const isOnPage = await workEntriesPage.isOnWorkEntriesPage();
  expect(isOnPage).toBe(true);
});

Then('I should be on the reports page', async function (this: PlaywrightWorld) {
  reportsPage = new ReportsPage(this.page!);
  const isOnPage = await reportsPage.isOnReportsPage();
  expect(isOnPage).toBe(true);
});

Then('I should see the no work entries message', async function (this: PlaywrightWorld) {
  const isVisible = await dashboardPage.isNoEntriesMessageVisible();
  expect(isVisible).toBe(true);
});
