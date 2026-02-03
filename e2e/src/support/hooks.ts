import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { PlaywrightWorld } from './world';

setDefaultTimeout(60000);

BeforeAll(async function () {
  console.log('Starting test execution...');
});

Before(async function (this: PlaywrightWorld) {
  await this.init();
});

After(async function (this: PlaywrightWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshotPath = `src/reports/screenshots/${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);
  }
  await this.cleanup();
});

AfterAll(async function () {
  console.log('Test execution completed.');
});
