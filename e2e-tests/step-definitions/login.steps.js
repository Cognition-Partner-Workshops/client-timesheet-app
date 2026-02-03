import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from 'chai';
import LoginPage from '../page-objects/LoginPage.js';
import DashboardPage from '../page-objects/DashboardPage.js';

Given('I am on the login page', async () => {
    await LoginPage.open();
});

When('I enter a valid email {string}', async (email) => {
    await LoginPage.enterEmail(email);
});

When('I enter an invalid email {string}', async (email) => {
    await LoginPage.enterEmail(email);
});

When('I click the login button', async () => {
    await LoginPage.clickLoginButton();
});

When('I clear the email field', async () => {
    await LoginPage.clearEmailField();
});

Then('I should be redirected to the dashboard', async () => {
    await DashboardPage.waitForUrl('/dashboard');
    const url = await browser.getUrl();
    expect(url).to.include('/dashboard');
});

Then('I should see the dashboard header {string}', async (headerText) => {
    const header = await DashboardPage.getPageHeader();
    expect(header).to.equal(headerText);
});

Then('I should see the page title {string}', async (title) => {
    const pageTitle = await LoginPage.getPageTitle();
    expect(pageTitle).to.equal(title);
});

Then('I should see the email input field', async () => {
    const isDisplayed = await LoginPage.isEmailInputDisplayed();
    expect(isDisplayed).to.be.true;
});

Then('I should see the login button', async () => {
    const isDisplayed = await LoginPage.isLoginButtonDisplayed();
    expect(isDisplayed).to.be.true;
});

Then('I should see the info message about no password', async () => {
    const isDisplayed = await LoginPage.isInfoMessageDisplayed();
    expect(isDisplayed).to.be.true;
});

Then('the login button should be disabled', async () => {
    const isDisabled = await LoginPage.isLoginButtonDisabled();
    expect(isDisabled).to.be.true;
});

Then('I should see an error message', async () => {
    await browser.pause(1000);
    const isDisplayed = await LoginPage.isErrorDisplayed();
    expect(isDisplayed).to.be.true;
});
