import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

export interface CustomWorld extends World {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  testData: Record<string, unknown>;
}

export class PlaywrightWorld extends World implements CustomWorld {
  browser: Browser | null = null;
  context: BrowserContext | null = null;
  page: Page | null = null;
  testData: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    const headless = process.env.HEADLESS !== 'false';
    this.browser = await chromium.launch({
      headless,
      slowMo: headless ? 0 : 100
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true
    });
    this.page = await this.context.newPage();
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

setWorldConstructor(PlaywrightWorld);
