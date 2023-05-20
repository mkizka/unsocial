// https://playwright.dev/docs/next/chrome-extensions#testing
import { type BrowserContext, chromium, test as base } from "@playwright/test";

export const test = base.extend<{
  context: BrowserContext;
}>({
  context: async ({}, use) => {
    const browser = await chromium.launch({
      args: ["--disable-databases"],
    });
    const context = await browser.newContext();
    await use(context);
    await context.close();
  },
});

export const expect = test.expect;
