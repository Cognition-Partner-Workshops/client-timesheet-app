import BasePage from './BasePage.js';

class ClientsPage extends BasePage {
    get pageHeader() { return $('h4'); }
    get addClientButton() { return $('//button[contains(text(),"Add Client")]'); }
    get clientsTable() { return $('table'); }
    get dialogTitle() { return $('.MuiDialogTitle-root'); }
    get clientNameInput() { return $('//label[contains(text(),"Client Name")]/following-sibling::div//input'); }
    get departmentInput() { return $('//label[contains(text(),"Department")]/following-sibling::div//input'); }
    get emailInput() { return $('//label[contains(text(),"Email")]/following-sibling::div//input'); }
    get descriptionInput() { return $('//label[contains(text(),"Description")]/following-sibling::div//textarea'); }
    get createButton() { return $('//button[contains(text(),"Create")]'); }
    get updateButton() { return $('//button[contains(text(),"Update")]'); }
    get cancelButton() { return $('//button[contains(text(),"Cancel")]'); }
    get errorAlert() { return $('.MuiAlert-standardError'); }
    get noClientsMessage() { return $('//p[contains(text(),"No clients found")]'); }
    get dialog() { return $('.MuiDialog-root'); }

    async open() {
        await super.open('/clients');
    }

    async getPageHeader() {
        const header = await this.pageHeader;
        await header.waitForDisplayed();
        return await header.getText();
    }

    async isAddClientButtonDisplayed() {
        const button = await this.addClientButton;
        return await button.isDisplayed();
    }

    async clickAddClientButton() {
        const button = await this.addClientButton;
        await button.waitForDisplayed();
        await button.click();
        await browser.pause(500);
    }

    async getDialogTitle() {
        const title = await this.dialogTitle;
        await title.waitForDisplayed();
        return await title.getText();
    }

    async enterClientName(name) {
        const input = await this.clientNameInput;
        await input.waitForDisplayed();
        await input.clearValue();
        if (name && name.trim()) {
            await input.setValue(name);
        }
    }

    async clearClientNameField() {
        const input = await this.clientNameInput;
        await input.clearValue();
        await browser.keys(['Tab']);
    }

    async enterDepartment(department) {
        const input = await this.departmentInput;
        await input.waitForDisplayed();
        await input.clearValue();
        if (department) {
            await input.setValue(department);
        }
    }

    async enterEmail(email) {
        const input = await this.emailInput;
        await input.waitForDisplayed();
        await input.clearValue();
        if (email) {
            await input.setValue(email);
        }
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

    async isClientInTable(clientName) {
        try {
            const client = await $(`//td//p[contains(text(),"${clientName}")]`);
            return await client.isDisplayed();
        } catch {
            return false;
        }
    }

    async getClientDepartment(clientName) {
        const row = await $(`//td//p[contains(text(),"${clientName}")]/ancestor::tr`);
        const departmentCell = await row.$('td:nth-child(2)');
        return await departmentCell.getText();
    }

    async clickEditButtonForClient(clientName) {
        const row = await $(`//td//p[contains(text(),"${clientName}")]/ancestor::tr`);
        const editButton = await row.$('button[color="primary"]');
        await editButton.click();
        await browser.pause(500);
    }

    async clickDeleteButtonForClient(clientName) {
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

    async createClient(name, department = '', email = '', description = '') {
        await this.clickAddClientButton();
        await this.enterClientName(name);
        if (department) await this.enterDepartment(department);
        if (email) await this.enterEmail(email);
        if (description) await this.enterDescription(description);
        await this.clickCreateButton();
        await browser.pause(500);
    }
}

export default new ClientsPage();
