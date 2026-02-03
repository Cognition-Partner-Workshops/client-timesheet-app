import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from 'chai';
import ClientsPage from '../page-objects/ClientsPage.js';

Then('I should see the clients page header {string}', async (headerText) => {
    const header = await ClientsPage.getPageHeader();
    expect(header).to.equal(headerText);
});

Then('I should see the {string} button', async (buttonText) => {
    if (buttonText === 'Add Client') {
        const isDisplayed = await ClientsPage.isAddClientButtonDisplayed();
        expect(isDisplayed).to.be.true;
    }
});

When('I click the {string} button', async (buttonText) => {
    if (buttonText === 'Add Client') {
        await ClientsPage.clickAddClientButton();
    }
});

Then('I should see the client dialog with title {string}', async (title) => {
    const dialogTitle = await ClientsPage.getDialogTitle();
    expect(dialogTitle).to.equal(title);
});

When('I enter client name {string}', async (name) => {
    await ClientsPage.enterClientName(name);
});

When('I enter client department {string}', async (department) => {
    await ClientsPage.enterDepartment(department);
});

When('I enter client email {string}', async (email) => {
    await ClientsPage.enterEmail(email);
});

When('I enter client description {string}', async (description) => {
    await ClientsPage.enterDescription(description);
});

When('I click the {string} button in the dialog', async (buttonText) => {
    if (buttonText === 'Create') {
        await ClientsPage.clickCreateButton();
    } else if (buttonText === 'Update') {
        await ClientsPage.clickUpdateButton();
    } else if (buttonText === 'Cancel') {
        await ClientsPage.clickCancelButton();
    }
});

Then('I should see the client {string} in the clients table', async (clientName) => {
    await browser.pause(500);
    const isInTable = await ClientsPage.isClientInTable(clientName);
    expect(isInTable).to.be.true;
});

Then('I should not see the client {string} in the clients table', async (clientName) => {
    await browser.pause(500);
    const isInTable = await ClientsPage.isClientInTable(clientName);
    expect(isInTable).to.be.false;
});

Then('the client {string} should have department {string}', async (clientName, department) => {
    const clientDepartment = await ClientsPage.getClientDepartment(clientName);
    expect(clientDepartment).to.include(department);
});

Given('a client {string} exists', async (clientName) => {
    await ClientsPage.open();
    await browser.pause(500);
    const isInTable = await ClientsPage.isClientInTable(clientName);
    if (!isInTable) {
        await ClientsPage.createClient(clientName);
    }
});

Given('no clients exist', async () => {
    await ClientsPage.open();
    await browser.pause(500);
    // Delete all existing clients
    let hasClients = true;
    while (hasClients) {
        try {
            const deleteButton = await $('button[color="error"]');
            const isDisplayed = await deleteButton.isDisplayed();
            if (isDisplayed) {
                await deleteButton.click();
                await browser.acceptAlert();
                await browser.pause(500);
            } else {
                hasClients = false;
            }
        } catch {
            hasClients = false;
        }
    }
});

When('I click the edit button for client {string}', async (clientName) => {
    await ClientsPage.clickEditButtonForClient(clientName);
});

When('I click the delete button for client {string}', async (clientName) => {
    await ClientsPage.clickDeleteButtonForClient(clientName);
});

When('I update the client name to {string}', async (newName) => {
    await ClientsPage.enterClientName(newName);
});

When('I leave the client name empty', async () => {
    await ClientsPage.clearClientNameField();
});

When('I clear the client name field', async () => {
    await ClientsPage.clearClientNameField();
});

Then('I should see an error message {string}', async (errorMessage) => {
    await browser.pause(500);
    const message = await ClientsPage.getErrorMessage();
    expect(message).to.include(errorMessage);
});

Then('I should see an error message containing {string}', async (errorText) => {
    await browser.pause(500);
    const message = await ClientsPage.getErrorMessage();
    expect(message.toLowerCase()).to.include(errorText.toLowerCase());
});
