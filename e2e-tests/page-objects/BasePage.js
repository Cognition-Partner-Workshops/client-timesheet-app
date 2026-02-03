export default class BasePage {
    async open(path) {
        await browser.url(path);
        await browser.pause(500);
    }

    async waitForElement(selector, timeout = 10000) {
        const element = await $(selector);
        await element.waitForDisplayed({ timeout });
        return element;
    }

    async waitForElementToDisappear(selector, timeout = 10000) {
        const element = await $(selector);
        await element.waitForDisplayed({ timeout, reverse: true });
    }

    async click(selector) {
        const element = await this.waitForElement(selector);
        await element.click();
    }

    async setValue(selector, value) {
        const element = await this.waitForElement(selector);
        await element.clearValue();
        await element.setValue(value);
    }

    async getText(selector) {
        const element = await this.waitForElement(selector);
        return await element.getText();
    }

    async isDisplayed(selector) {
        try {
            const element = await $(selector);
            return await element.isDisplayed();
        } catch {
            return false;
        }
    }

    async isEnabled(selector) {
        try {
            const element = await $(selector);
            return await element.isEnabled();
        } catch {
            return false;
        }
    }

    async getUrl() {
        return await browser.getUrl();
    }

    async waitForUrl(urlPart, timeout = 10000) {
        await browser.waitUntil(
            async () => {
                const url = await browser.getUrl();
                return url.includes(urlPart);
            },
            { timeout, timeoutMsg: `Expected URL to contain ${urlPart}` }
        );
    }

    async acceptAlert() {
        try {
            await browser.acceptAlert();
        } catch {
            // Alert might not be present
        }
    }

    async dismissAlert() {
        try {
            await browser.dismissAlert();
        } catch {
            // Alert might not be present
        }
    }

    async scrollToElement(selector) {
        const element = await $(selector);
        await element.scrollIntoView();
    }

    async selectByVisibleText(selector, text) {
        const element = await this.waitForElement(selector);
        await element.selectByVisibleText(text);
    }

    async pause(ms) {
        await browser.pause(ms);
    }
}
