function getBrowserName() {
    const browser = process.env.BROWSER || 'chrome';
    const validBrowsers = ['chrome', 'firefox', 'MicrosoftEdge'];
    if (validBrowsers.includes(browser)) {
        return browser;
    }
    return 'chrome';
}

function getServices() {
    const browserName = getBrowserName();
    const services = [];
    
    if (browserName === 'chrome') {
        services.push('chromedriver');
    } else if (browserName === 'firefox') {
        services.push('geckodriver');
    } else if (browserName === 'MicrosoftEdge') {
        services.push('edgedriver');
    } else {
        services.push('chromedriver');
    }
    
    return services;
}

function getChromeOptions() {
    const options = {
        args: ['--no-sandbox', '--disable-dev-shm-usage']
    };
    if (process.env.HEADLESS === 'true') {
        options.args.push('--headless', '--disable-gpu');
    }
    if (process.env.CHROME_BIN) {
        options.binary = process.env.CHROME_BIN;
    }
    return options;
}

export const config = {
    runner: 'local',
    specs: [
        './features/**/*.feature'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        browserName: getBrowserName(),
        'goog:chromeOptions': getChromeOptions(),
        'moz:firefoxOptions': {
            args: process.env.HEADLESS === 'true' ? ['-headless'] : []
        },
        'ms:edgeOptions': {
            args: process.env.HEADLESS === 'true' ? ['--headless', '--disable-gpu'] : []
        }
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: getServices(),
    framework: 'cucumber',
    reporters: ['spec'],
    cucumberOpts: {
        require: ['./step-definitions/**/*.js', './support/**/*.js'],
        backtrace: false,
        requireModule: [],
        dryRun: false,
        failFast: false,
        snippets: true,
        source: true,
        strict: false,
        tagExpression: '',
        timeout: 60000,
        ignoreUndefinedDefinitions: false
    },
    before: async function () {
        await browser.setWindowSize(1920, 1080);
    },
    afterScenario: async function () {
        await browser.deleteCookies();
        await browser.execute('window.localStorage.clear()');
    }
};
