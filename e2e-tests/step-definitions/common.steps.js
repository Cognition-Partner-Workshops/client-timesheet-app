import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from 'chai';
import LoginPage from '../page-objects/LoginPage.js';
import DashboardPage from '../page-objects/DashboardPage.js';
import ClientsPage from '../page-objects/ClientsPage.js';
import WorkEntriesPage from '../page-objects/WorkEntriesPage.js';
import ReportsPage from '../page-objects/ReportsPage.js';

Given('I am logged in as {string}', async (email) => {
    await LoginPage.open();
    await LoginPage.login(email);
    await DashboardPage.waitForUrl('/dashboard');
});

Given('I am not logged in', async () => {
    await browser.deleteCookies();
    await browser.execute('window.localStorage.clear()');
});

When('I try to navigate directly to the dashboard', async () => {
    await browser.url('/dashboard');
});

Then('I should be redirected to the login page', async () => {
    await browser.pause(1000);
    const url = await browser.getUrl();
    expect(url).to.include('/login');
});

Given('I navigate to the clients page', async () => {
    await ClientsPage.open();
    await browser.pause(500);
});

Given('I navigate to the work entries page', async () => {
    await WorkEntriesPage.open();
    await browser.pause(500);
});

Given('I navigate to the reports page', async () => {
    await ReportsPage.open();
    await browser.pause(500);
});

When('I navigate to the dashboard', async () => {
    await DashboardPage.open();
    await browser.pause(500);
});

Then('I should be on the clients page', async () => {
    await browser.pause(500);
    const url = await browser.getUrl();
    expect(url).to.include('/clients');
});

Then('I should be on the work entries page', async () => {
    await browser.pause(500);
    const url = await browser.getUrl();
    expect(url).to.include('/work-entries');
});

Then('I should be on the reports page', async () => {
    await browser.pause(500);
    const url = await browser.getUrl();
    expect(url).to.include('/reports');
});

Then('I should see the message {string}', async (message) => {
    await browser.pause(500);
    const pageSource = await browser.getPageSource();
    expect(pageSource).to.include(message);
});

When('I confirm the deletion', async () => {
    await browser.acceptAlert();
    await browser.pause(500);
});

Then('the dialog should be closed', async () => {
    await browser.pause(500);
    const dialogExists = await ClientsPage.isDialogDisplayed();
    expect(dialogExists).to.be.false;
});
