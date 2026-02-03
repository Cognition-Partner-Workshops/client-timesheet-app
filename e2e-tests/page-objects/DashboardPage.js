import BasePage from './BasePage.js';

class DashboardPage extends BasePage {
    get pageHeader() { return $('h4'); }
    get totalClientsCard() { return $('//h6[contains(text(),"Total Clients")]/ancestor::div[contains(@class,"MuiCardContent")]'); }
    get totalWorkEntriesCard() { return $('//h6[contains(text(),"Total Work Entries")]/ancestor::div[contains(@class,"MuiCardContent")]'); }
    get totalHoursCard() { return $('//h6[contains(text(),"Total Hours")]/ancestor::div[contains(@class,"MuiCardContent")]'); }
    get recentWorkEntriesSection() { return $('//h6[contains(text(),"Recent Work Entries")]'); }
    get quickActionsSection() { return $('//h6[contains(text(),"Quick Actions")]'); }
    get addClientButton() { return $('//button[contains(text(),"Add Client")]'); }
    get addWorkEntryButton() { return $('//button[contains(text(),"Add Work Entry")]'); }
    get viewReportsButton() { return $('//button[contains(text(),"View Reports")]'); }
    get noWorkEntriesMessage() { return $('//p[contains(text(),"No work entries yet")]'); }

    async open() {
        await super.open('/dashboard');
    }

    async getPageHeader() {
        const header = await this.pageHeader;
        await header.waitForDisplayed();
        return await header.getText();
    }

    async isTotalClientsCardDisplayed() {
        try {
            const card = await this.totalClientsCard;
            return await card.isDisplayed();
        } catch {
            return false;
        }
    }

    async isTotalWorkEntriesCardDisplayed() {
        try {
            const card = await this.totalWorkEntriesCard;
            return await card.isDisplayed();
        } catch {
            return false;
        }
    }

    async isTotalHoursCardDisplayed() {
        try {
            const card = await this.totalHoursCard;
            return await card.isDisplayed();
        } catch {
            return false;
        }
    }

    async getTotalClientsValue() {
        const card = await this.totalClientsCard;
        const valueElement = await card.$('.//div[contains(@class,"MuiTypography-h4")]');
        return await valueElement.getText();
    }

    async getTotalWorkEntriesValue() {
        const card = await this.totalWorkEntriesCard;
        const valueElement = await card.$('.//div[contains(@class,"MuiTypography-h4")]');
        return await valueElement.getText();
    }

    async getTotalHoursValue() {
        const card = await this.totalHoursCard;
        const valueElement = await card.$('.//div[contains(@class,"MuiTypography-h4")]');
        return await valueElement.getText();
    }

    async clickTotalClientsCard() {
        const card = await $('//h6[contains(text(),"Total Clients")]/ancestor::div[contains(@class,"MuiCard-root")]');
        await card.click();
    }

    async clickTotalWorkEntriesCard() {
        const card = await $('//h6[contains(text(),"Total Work Entries")]/ancestor::div[contains(@class,"MuiCard-root")]');
        await card.click();
    }

    async clickTotalHoursCard() {
        const card = await $('//h6[contains(text(),"Total Hours")]/ancestor::div[contains(@class,"MuiCard-root")]');
        await card.click();
    }

    async isRecentWorkEntriesSectionDisplayed() {
        try {
            const section = await this.recentWorkEntriesSection;
            return await section.isDisplayed();
        } catch {
            return false;
        }
    }

    async isClientInRecentEntries(clientName) {
        try {
            const entry = await $(`//h6[contains(text(),"Recent Work Entries")]/following::*[contains(text(),"${clientName}")]`);
            return await entry.isDisplayed();
        } catch {
            return false;
        }
    }

    async isAddClientButtonDisplayed() {
        try {
            const button = await this.addClientButton;
            return await button.isDisplayed();
        } catch {
            return false;
        }
    }

    async isAddWorkEntryButtonDisplayed() {
        try {
            const button = await this.addWorkEntryButton;
            return await button.isDisplayed();
        } catch {
            return false;
        }
    }

    async isViewReportsButtonDisplayed() {
        try {
            const button = await this.viewReportsButton;
            return await button.isDisplayed();
        } catch {
            return false;
        }
    }

    async clickAddClientButton() {
        const button = await this.addClientButton;
        await button.click();
    }

    async clickAddWorkEntryButton() {
        const button = await this.addWorkEntryButton;
        await button.click();
    }

    async clickViewReportsButton() {
        const button = await this.viewReportsButton;
        await button.click();
    }

    async isNoWorkEntriesMessageDisplayed() {
        try {
            const message = await this.noWorkEntriesMessage;
            return await message.isDisplayed();
        } catch {
            return false;
        }
    }
}

export default new DashboardPage();
