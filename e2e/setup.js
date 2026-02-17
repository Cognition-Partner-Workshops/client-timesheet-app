const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

let driver;

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--remote-debugging-port=9222');
  options.addArguments('--disable-extensions');
  options.addArguments('--disable-web-security');
  options.addArguments('--allow-running-insecure-content');
  options.addArguments('--ignore-certificate-errors');

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({
    implicit: 5000,
    pageLoad: 30000,
    script: 30000
  });

  global.driver = driver;
}, 60000);

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
}, 30000);

global.BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
global.API_URL = process.env.API_URL || 'http://localhost:3001';
