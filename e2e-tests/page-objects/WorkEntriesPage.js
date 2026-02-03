import BasePage from './BasePage.js';

class WorkEntriesPage extends BasePage {
    get pageHeader() { return $('h4'); }
    get addWorkEntryButton() { return $('//button[contains(text(),"Add Work Entry")]'); }
    get workEntriesTable() { return $('table'); }
    get dialogTitle() { return $('.MuiDialogTitle-root'); }
    get clientSelect() { return $('//label[contains(text(),"Client")]/following-sibling::div'); }
    get hoursInput() { return $('//label[contains(text(),"Hours")]/following-sibling::div//input'); }
    get dateInput() { return $('//label[contains(text(),"Date")]/following-sibling::div//input'); }
    get descriptionInput() { return $('//label[contains(text(),"Description")]/following-sibling::div//textarea'); }
    get createButton() { return $('//button[contains(text(),"Create")]'); }
    get updateButton() { return $('//button[contains(text(),"Update")]'); }
    get cancelButton() { return $('//button[contains(text(),"Cancel")]'); }
    get errorAlert() { return $('.MuiAlert-standardError'); }
    get noWorkEntriesMessage() { return $('//p[contains(text(),"No work entries found")]'); }
    get noClientsMessage() { return $('//p[contains(text(),"You need to create at least one client")]'); }
    get dialog() { return $('.MuiDialog-root'); }
    get createClientButton() { return $('//a[contains(text(),"Create Client")]'); }

    async open() {
        await super.open('/work-entries');
    }

    async getPageHeader() {
        const header = await this.pageHeader;
        await header.waitForDisplayed();
        return await header.getText();
    }

    async isAddWorkEntryButtonDisplayed() {
        const button = await this.addWorkEntryButton;
        return await button.isDisplayed();
    }

    async clickAddWorkEntryButton() {
        const button = await this.addWorkEntryButton;
        await button.waitForDisplayed();
        await button.click();
        await browser.pause(500);
    }

    async getDialogTitle() {
        const title = await this.dialogTitle;
        await title.waitForDisplayed();
        return await title.getText();
    }

    async selectClient(clientName) {
        const selectDiv = await this.clientSelect;
        await selectDiv.click();
        await browser.pause(300);
        const option = await $(`//li[contains(text(),"${clientName}")]`);
        await option.waitForDisplayed();
        await option.click();
        await browser.pause(300);
    }

    async enterHours(hours) {
        const input = await this.hoursInput;
        await input.waitForDisplayed();
        await input.clearValue();
        if (hours !== undefined && hours !== '') {
            await input.setValue(hours);
        }
    }

    async selectTodaysDate() {
        // The date picker should default to today, so we just verify it's set
        const input = await this.dateInput;
        await input.waitForDisplayed();
    }

    async enterDescription(description) {
        const input = await this.descriptionInput;
        await input.waitForDisplayed();
        await input.clearValue();
        if (description) {
            await input.setValue(description);
        }
    }

    async clickCreateButton() {
        const button = await this.createButton;
        await button.waitForDisplayed();
        await button.click();
        await browser.pause(500);
    }

    async clickUpdateButton() {
        const button = await this.updateButton;
        await button.waitForDisplayed();
        await button.click();
        await browser.pause(500);
    }

    async clickCancelButton() {
        const button = await this.cancelButton;
        await button.waitForDisplayed();
        await button.click();
        await browser.pause(300);
    }

    async isWorkEntryInTable(clientName, hours) {
        try {
            const entry = await $(`//td//p[contains(text(),"${clientName}")]/ancestor::tr//span[contains(text(),"${hours} hours")]`);
            return await entry.isDisplayed();
        } catch {
            return false;
        }
    }

    async clickEditButtonForWorkEntry(clientName) {
        const row = await $(`//td//p[contains(text(),"${clientName}")]/ancestor::tr`);
        const editButton = await row.$('button[color="primary"]');
        await editButton.click();
        await browser.pause(500);
    }

    async clickDeleteButtonForWorkEntry(clientName) {
        const row = await $(`//td//p[contains(text(),"${clientName}")]/ancestor::tr`);
        const deleteButton = await row.$('button[color="error"]');
        await deleteButton.click();
    }

    async confirmDeletion() {
        await browser.acceptAlert();
        await browser.pause(500);
    }

    async cancelDeletion() {
        await browser.dismissAlert();
    }

    async getErrorMessage() {
        const alert = await this.errorAlert;
        await alert.waitForDisplayed({ timeout: 5000 });
        return await alert.getText();
    }

    async isErrorDisplayed() {
        try {
            const alert = await this.errorAlert;
            return await alert.isDisplayed();
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

    async isNoClientsMessageDisplayed() {
        try {
            const message = await this.noClientsMessage;
            return await message.isDisplayed();
        } catch {
            return false;
        }
    }

    async isDialogDisplayed() {
        try {
            const dialog = await this.dialog;
            return await dialog.isDisplayed();
        } catch {
            return false;
        }
    }

    async createWorkEntry(clientName, hours, description = '') {
        await this.clickAddWorkEntryButton();
        await this.selectClient(clientName);
        await this.enterHours(hours);
        await this.selectTodaysDate();
        if (description) await this.enterDescription(description);
        await this.clickCreateButton();
        await browser.pause(500);
    }

    async getWorkEntryCount() {
        try {
            const rows = await $$('table tbody tr');
            const firstRow = await rows[0].$('td');
            const text = await firstRow.getText();
            if (text.includes('No work entries')) {
                return 0;
            }
            return rows.length;
        } catch {
            return 0;
        }
    }
}

export default new WorkEntriesPage();
