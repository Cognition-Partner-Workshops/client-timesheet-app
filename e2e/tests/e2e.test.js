const { By, until } = require('selenium-webdriver');
const { 
  waitForElement, 
  waitForElementClickable, 
  waitForElementVisible,
  isElementPresent
} = require('../helpers/testHelpers');

describe('Client Timesheet Application E2E Tests', () => {
  const testEmail = `test-e2e-${Date.now()}@example.com`;

  describe('Login Page', () => {
    beforeEach(async () => {
      await driver.get(global.BASE_URL);
      await driver.sleep(3000);
    });

    test('should display login page with Time Tracker title', async () => {
      const title = await waitForElement(driver, By.xpath("//*[contains(text(), 'Time Tracker')]"));
      expect(await title.isDisplayed()).toBe(true);
    });

    test('should display email input field', async () => {
      const emailInput = await waitForElement(driver, By.css('#email'));
      expect(await emailInput.isDisplayed()).toBe(true);
    });

    test('should display login button', async () => {
      const loginButton = await waitForElement(driver, By.css('button[type="submit"]'));
      expect(await loginButton.isDisplayed()).toBe(true);
    });

    test('should have disabled login button when email is empty', async () => {
      const loginButton = await waitForElement(driver, By.css('button[type="submit"]'));
      const isDisabled = await loginButton.getAttribute('disabled');
      expect(isDisabled).toBe('true');
    });

    test('should enable login button when email is entered', async () => {
      const emailInput = await waitForElementClickable(driver, By.css('#email'));
      await emailInput.sendKeys(testEmail);

      const loginButton = await waitForElement(driver, By.css('button[type="submit"]'));
      const isDisabled = await loginButton.getAttribute('disabled');
      expect(isDisabled).toBeNull();
    });

    test('should show info message about no password', async () => {
      const infoMessage = await waitForElement(driver, By.xpath("//*[contains(text(), 'does not have a password')]"));
      expect(await infoMessage.isDisplayed()).toBe(true);
    });
  });

  describe('Login and Navigation', () => {
    beforeAll(async () => {
      await driver.get(global.BASE_URL);
      await driver.sleep(3000);
      
      const emailInput = await waitForElementClickable(driver, By.css('#email'));
      await emailInput.clear();
      await emailInput.sendKeys(testEmail);
      
      const loginButton = await waitForElementClickable(driver, By.css('button[type="submit"]'));
      await loginButton.click();
      
      await driver.sleep(5000);
    }, 60000);

    test('should redirect to dashboard after login', async () => {
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).toContain('/dashboard');
    });

    test('should display Dashboard page title', async () => {
      await driver.get(`${global.BASE_URL}/dashboard`);
      await driver.sleep(2000);
      
      const title = await waitForElementVisible(driver, By.xpath("//h4[contains(text(), 'Dashboard')]"));
      expect(await title.getText()).toBe('Dashboard');
    });

    test('should navigate to Clients page', async () => {
      await driver.get(`${global.BASE_URL}/clients`);
      await driver.sleep(2000);
      
      const title = await waitForElementVisible(driver, By.xpath("//h4[contains(text(), 'Clients')]"));
      expect(await title.getText()).toBe('Clients');
    });

    test('should navigate to Work Entries page', async () => {
      await driver.get(`${global.BASE_URL}/work-entries`);
      await driver.sleep(2000);
      
      const title = await waitForElementVisible(driver, By.xpath("//h4[contains(text(), 'Work Entries')]"));
      expect(await title.getText()).toBe('Work Entries');
    });

    test('should navigate to Reports page', async () => {
      await driver.get(`${global.BASE_URL}/reports`);
      await driver.sleep(2000);
      
      const title = await waitForElementVisible(driver, By.xpath("//h4[contains(text(), 'Reports')]"));
      expect(await title.getText()).toBe('Reports');
    });
  });
});
