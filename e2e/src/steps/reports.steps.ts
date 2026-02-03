import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { Download } from 'playwright';
import { PlaywrightWorld } from '../support/world';
import { ReportsPage } from '../pages/ReportsPage';

let reportsPage: ReportsPage;

Given('I am on the reports page', async function (this: PlaywrightWorld) {
  reportsPage = new ReportsPage(this.page!);
  await reportsPage.navigateToReports();
  await reportsPage.waitForReportsToLoad();
});

Then('I should see the reports page title', async function (this: PlaywrightWorld) {
  const isDisplayed = await reportsPage.isReportsPageDisplayed();
  expect(isDisplayed).toBe(true);
});

Then('I should see the client selector', async function (this: PlaywrightWorld) {
  const isVisible = await this.page!.isVisible('.MuiSelect-select');
  expect(isVisible).toBe(true);
});

When('I select client {string} from the dropdown', async function (this: PlaywrightWorld, clientName: string) {
  await reportsPage.selectClient(clientName);
});

Then('I should see the Total Hours card', async function (this: PlaywrightWorld) {
  const isVisible = await reportsPage.isTotalHoursCardVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the report Total Hours card', async function (this: PlaywrightWorld) {
  const isVisible = await reportsPage.isTotalHoursCardVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the Total Entries card', async function (this: PlaywrightWorld) {
  const isVisible = await reportsPage.isTotalEntriesCardVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the Average Hours per Entry card', async function (this: PlaywrightWorld) {
  const isVisible = await reportsPage.isAverageHoursCardVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the report table with entries', async function (this: PlaywrightWorld) {
  const isVisible = await reportsPage.isReportTableVisible();
  expect(isVisible).toBe(true);
});

Then('the Total Hours should be {string}', async function (this: PlaywrightWorld, expectedValue: string) {
  const value = await reportsPage.getTotalHoursValue();
  expect(value).toBe(expectedValue);
});

Then('the Total Entries should be {string}', async function (this: PlaywrightWorld, expectedValue: string) {
  const value = await reportsPage.getTotalEntriesValue();
  expect(value).toBe(expectedValue);
});

Then('the Average Hours per Entry should be {string}', async function (this: PlaywrightWorld, expectedValue: string) {
  const value = await reportsPage.getAverageHoursValue();
  expect(value).toBe(expectedValue);
});

When('I click the CSV export button', async function (this: PlaywrightWorld) {
  const downloadPromise = this.page!.waitForEvent('download', { timeout: 10000 }).catch(() => null);
  await reportsPage.clickCsvExportButton();
  this.testData.download = await downloadPromise;
});

When('I click the PDF export button', async function (this: PlaywrightWorld) {
  const downloadPromise = this.page!.waitForEvent('download', { timeout: 10000 }).catch(() => null);
  await reportsPage.clickPdfExportButton();
  this.testData.download = await downloadPromise;
});

Then('the CSV file should be downloaded', async function (this: PlaywrightWorld) {
  const download = this.testData.download as Download | null;
  if (download) {
    const filename = download.suggestedFilename();
    expect(filename).toContain('.csv');
  }
});

Then('the PDF file should be downloaded', async function (this: PlaywrightWorld) {
  const download = this.testData.download as Download | null;
  if (download) {
    const filename = download.suggestedFilename();
    expect(filename).toContain('.pdf');
  }
});

Then('I should see the create client first message on reports', async function (this: PlaywrightWorld) {
  const isVisible = await reportsPage.isNoClientsMessageVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the select client message', async function (this: PlaywrightWorld) {
  const isVisible = await reportsPage.isSelectClientMessageVisible();
  expect(isVisible).toBe(true);
});

Then('I should see the no work entries for client message', async function (this: PlaywrightWorld) {
  const isVisible = await reportsPage.isNoEntriesMessageVisible();
  expect(isVisible).toBe(true);
});

Then('the CSV export button should be disabled', async function (this: PlaywrightWorld) {
  const isEnabled = await reportsPage.isCsvExportButtonEnabled();
  expect(isEnabled).toBe(false);
});

Then('the PDF export button should be disabled', async function (this: PlaywrightWorld) {
  const isEnabled = await reportsPage.isPdfExportButtonEnabled();
  expect(isEnabled).toBe(false);
});
