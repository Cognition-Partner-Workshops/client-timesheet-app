import BasePage from './BasePage.js';

class LoginPage extends BasePage {
    get pageTitle() { return $('h1'); }
    get emailInput() { return $('input#email'); }
    get loginButton() { return $('button[type="submit"]'); }
    get infoAlert() { return $('.MuiAlert-standardInfo'); }
    get errorAlert() { return $('.MuiAlert-standardError'); }

    async open() {
        await super.open('/login');
    }

    async getPageTitle() {
        const title = await this.pageTitle;
        await title.waitForDisplayed();
        return await title.getText();
    }

    async enterEmail(email) {
        const input = await this.emailInput;
        await input.waitForDisplayed();
        await input.clearValue();
        await input.setValue(email);
    }

    async clearEmailField() {
        const input = await this.emailInput;
        await input.clearValue();
        await browser.keys(['Tab']);
    }

    async clickLoginButton() {
        const button = await this.loginButton;
        await button.waitForDisplayed();
        await button.click();
    }

    async isLoginButtonEnabled() {
        const button = await this.loginButton;
        return await button.isEnabled();
    }

    async isLoginButtonDisabled() {
        const button = await this.loginButton;
        const isDisabled = await button.getAttribute('disabled');
        return isDisabled !== null;
    }

    async isEmailInputDisplayed() {
        const input = await this.emailInput;
        return await input.isDisplayed();
    }

    async isLoginButtonDisplayed() {
        const button = await this.loginButton;
        return await button.isDisplayed();
    }

    async isInfoMessageDisplayed() {
        const alert = await this.infoAlert;
        return await alert.isDisplayed();
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

    async login(email) {
        await this.enterEmail(email);
        await this.clickLoginButton();
    }
}

export default new LoginPage();
