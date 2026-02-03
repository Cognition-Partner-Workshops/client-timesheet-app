import BasePage from './BasePage.js';

class ReportsPage extends BasePage {
    get pageHeader() { return $('h4'); }
    get clientSelector() { return $('//label[contains(text(),"Select Client")]/following-sibling::div'); }
    get csvExportButton() { return $('//button[contains(@aria-label,"Export as CSV") or .//svg[contains(@data-testid,"DescriptionIcon")]]'); }
    get pdfExportButton() { return $('//button[contains(@aria-label,"Export as PDF") or .//svg[contains(@data-testid,"PictureAsPdfIcon")]]'); }
    get totalHoursCard() { return $('//p[contains(text(),"Total Hours")]/following-sibling::div'); }
    get totalEntriesCard() { return $('//p[contains(text(),"Total Entries")]/following-sibling::div'); }
    get averageHoursCard() { return $('//p[contains(text(),"Average Hours per Entry")]/following-sibling::div'); }
    get workEntriesTable() { return $('table'); }
    get noClientsMessage() { return $('//p[contains(text(),"You need to create at least one client before generating reports")]'); }
    get selectClientMessage() { return $('//p[contains(text(),"Select a client to view their time report")]'); }
    get noWorkEntriesMessage() { return $('//p[contains(text(),"No work entries found for this client")]'); }
    get createClientButton() { return $('//a[contains(text(),"Create Client")]'); }

    async open() {
        await super.open('/reports');
    }

    async getPageHeader() {
        const header = await this.pageHeader;
        await header.waitForDisplayed();
        return await header.getText();
    }

    async isClientSelectorDisplayed() {
        try {
            const selector = await this.clientSelector;
            return await selector.isDisplayed();
        } catch {
            return false;
        }
    }

    async selectClient(clientName) {
        const selectDiv = await this.clientSelector;
        await selectDiv.click();
        await browser.pause(300);
        const option = await $(`//li[contains(text(),"${clientName}")]`);
        await option.waitForDisplayed();
        await option.click();
        await browser.pause(1000);
    }

    async getTotalHours() {
        const card = await $('//p[contains(text(),"Total Hours")]/ancestor::div[contains(@class,"MuiCardContent")]//div[contains(@class,"MuiTypography-h4")]');
        await card.waitForDisplayed();
        return await card.getText();
    }

    async getTotalEntries() {
        const card = await $('//p[contains(text(),"Total Entries")]/ancestor::div[contains(@class,"MuiCardContent")]//div[contains(@class,"MuiTypography-h4")]');
        await card.waitForDisplayed();
        return await card.getText();
    }

    async getAverageHoursPerEntry() {
        const card = await $('//p[contains(text(),"Average Hours per Entry")]/ancestor::div[contains(@class,"MuiCardContent")]//div[contains(@class,"MuiTypography-h4")]');
        await card.waitForDisplayed();
        return await card.getText();
    }

    async isWorkEntriesTableDisplayed() {
        try {
            const table = await this.workEntriesTable;
            return await table.isDisplayed();
        } catch {
            return false;
        }
    }

    async isWorkEntryRowDisplayed(hours, description) {
        try {
            let selector;
            if (description) {
                selector = `//td//span[contains(text(),"${hours} hours")]/ancestor::tr//p[contains(text(),"${description}")]`;
            } else {
                selector = `//td//span[contains(text(),"${hours} hours")]`;
            }
            const row = await $(selector);
            return await row.isDisplayed();
        } catch {
            return false;
        }
    }

    async clickCsvExportButton() {
        const button = await $('//button[.//svg[@data-testid="DescriptionIcon"]]');
        await button.waitForDisplayed();
        await button.click();
        await browser.pause(1000);
    }

    async clickPdfExportButton() {
        const button = await $('//button[.//svg[@data-testid="PictureAsPdfIcon"]]');
        await button.waitForDisplayed();
        await button.click();
        await browser.pause(1000);
    }

    async isCsvExportButtonDisabled() {
        try {
            const button = await $('//button[.//svg[@data-testid="DescriptionIcon"]]');
            const isDisabled = await button.getAttribute('disabled');
            return isDisabled !== null;
        } catch {
            return true;
        }
    }

    async isPdfExportButtonDisabled() {
        try {
            const button = await $('//button[.//svg[@data-testid="PictureAsPdfIcon"]]');
            const isDisabled = await button.getAttribute('disabled');
            return isDisabled !== null;
        } catch {
            return true;
        }
    }

    async isNoClientsMessageDisplayed() {
        try {
            const message = await this.noClientsMessage;
            return await message.isDisplayed();
        } catch {
            return false;
        }
    }

    async isSelectClientMessageDisplayed() {
        try {
            const message = await this.selectClientMessage;
            return await message.isDisplayed();
        } catch {
            return false;
        }
    }

    async isNoWorkEntriesMessageDisplayed() {
        try {
            const message = await this.noWorkEntriesMessage;
            return await message.isDisplayed();
        } catch {
            return false;
        }
    }

    async isCreateClientButtonDisplayed() {
        try {
            const button = await this.createClientButton;
            return await button.isDisplayed();
        } catch {
            return false;
        }
    }
}

export default new ReportsPage();
