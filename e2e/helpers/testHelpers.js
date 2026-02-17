const { By, until } = require('selenium-webdriver');

const TIMEOUT = 10000;

async function waitForElement(driver, locator, timeout = TIMEOUT) {
  return await driver.wait(until.elementLocated(locator), timeout);
}

async function waitForElementVisible(driver, locator, timeout = TIMEOUT) {
  const element = await waitForElement(driver, locator, timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

async function waitForElementClickable(driver, locator, timeout = TIMEOUT) {
  const element = await waitForElementVisible(driver, locator, timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);
  return element;
}

async function login(driver, email) {
  await driver.get(global.BASE_URL);
  
  await driver.sleep(3000);
  
  const emailInput = await waitForElementClickable(driver, By.css('#email'));
  await emailInput.clear();
  await emailInput.sendKeys(email);
  
  const loginButton = await waitForElementClickable(driver, By.css('button[type="submit"]'));
  await loginButton.click();
  
  await driver.sleep(5000);
}

async function navigateTo(driver, path) {
  await driver.get(`${global.BASE_URL}${path}`);
  await driver.sleep(500);
}

async function clearInputAndType(driver, element, text) {
  await element.clear();
  await element.sendKeys(text);
}

async function getTextContent(driver, locator) {
  const element = await waitForElement(driver, locator);
  return await element.getText();
}

async function isElementPresent(driver, locator, timeout = 3000) {
  try {
    await driver.wait(until.elementLocated(locator), timeout);
    return true;
  } catch {
    return false;
  }
}

async function waitForPageLoad(driver) {
  await driver.wait(async () => {
    const readyState = await driver.executeScript('return document.readyState');
    return readyState === 'complete';
  }, TIMEOUT);
}

module.exports = {
  waitForElement,
  waitForElementVisible,
  waitForElementClickable,
  login,
  navigateTo,
  clearInputAndType,
  getTextContent,
  isElementPresent,
  waitForPageLoad,
  TIMEOUT
};
