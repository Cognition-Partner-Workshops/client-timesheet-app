import { Before, After, BeforeAll, AfterAll } from '@wdio/cucumber-framework';

BeforeAll(async () => {
    console.log('Starting E2E test suite...');
});

AfterAll(async () => {
    console.log('E2E test suite completed.');
});

Before(async (scenario) => {
    console.log(`Starting scenario: ${scenario.pickle.name}`);
    await browser.deleteCookies();
    await browser.execute('window.localStorage.clear()');
});

After(async (scenario) => {
    if (scenario.result.status === 'FAILED') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = `./screenshots/${scenario.pickle.name.replace(/\s+/g, '_')}_${timestamp}.png`;
        await browser.saveScreenshot(screenshotPath);
        console.log(`Screenshot saved: ${screenshotPath}`);
    }
    console.log(`Finished scenario: ${scenario.pickle.name} - Status: ${scenario.result.status}`);
});
