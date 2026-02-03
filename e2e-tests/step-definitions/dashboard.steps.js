import { Given, When, Then } from '@wdio/cucumber-framework';
import { expect } from 'chai';
import DashboardPage from '../page-objects/DashboardPage.js';

Then('I should see the dashboard header {string}', async (headerText) => {
    const header = await DashboardPage.getPageHeader();
    expect(header).to.equal(headerText);
});

Then('I should see the {string} metric card', async (cardName) => {
    if (cardName === 'Total Clients') {
        const isDisplayed = await DashboardPage.isTotalClientsCardDisplayed();
        expect(isDisplayed).to.be.true;
    } else if (cardName === 'Total Work Entries') {
        const isDisplayed = await DashboardPage.isTotalWorkEntriesCardDisplayed();
        expect(isDisplayed).to.be.true;
    } else if (cardName === 'Total Hours') {
        const isDisplayed = await DashboardPage.isTotalHoursCardDisplayed();
        expect(isDisplayed).to.be.true;
    }
});

Then('the {string} metric should show {string}', async (metricName, value) => {
    await browser.pause(500);
    if (metricName === 'Total Clients') {
        const actualValue = await DashboardPage.getTotalClientsValue();
        expect(actualValue).to.equal(value);
    } else if (metricName === 'Total Work Entries') {
        const actualValue = await DashboardPage.getTotalWorkEntriesValue();
        expect(actualValue).to.equal(value);
    } else if (metricName === 'Total Hours') {
        const actualValue = await DashboardPage.getTotalHoursValue();
        expect(actualValue).to.equal(value);
    }
});

When('I click on the {string} card', async (cardName) => {
    if (cardName === 'Total Clients') {
        await DashboardPage.clickTotalClientsCard();
    } else if (cardName === 'Total Work Entries') {
        await DashboardPage.clickTotalWorkEntriesCard();
    } else if (cardName === 'Total Hours') {
        await DashboardPage.clickTotalHoursCard();
    }
});

Then('I should see the {string} section', async (sectionName) => {
    if (sectionName === 'Recent Work Entries') {
        const isDisplayed = await DashboardPage.isRecentWorkEntriesSectionDisplayed();
        expect(isDisplayed).to.be.true;
    }
});

Then('I should see {string} in the recent entries', async (clientName) => {
    const isDisplayed = await DashboardPage.isClientInRecentEntries(clientName);
    expect(isDisplayed).to.be.true;
});

Then('I should see the {string} quick action button', async (buttonName) => {
    if (buttonName === 'Add Client') {
        const isDisplayed = await DashboardPage.isAddClientButtonDisplayed();
        expect(isDisplayed).to.be.true;
    } else if (buttonName === 'Add Work Entry') {
        const isDisplayed = await DashboardPage.isAddWorkEntryButtonDisplayed();
        expect(isDisplayed).to.be.true;
    } else if (buttonName === 'View Reports') {
        const isDisplayed = await DashboardPage.isViewReportsButtonDisplayed();
        expect(isDisplayed).to.be.true;
    }
});

When('I click the {string} quick action button', async (buttonName) => {
    if (buttonName === 'Add Client') {
        await DashboardPage.clickAddClientButton();
    } else if (buttonName === 'Add Work Entry') {
        await DashboardPage.clickAddWorkEntryButton();
    } else if (buttonName === 'View Reports') {
        await DashboardPage.clickViewReportsButton();
    }
});
