// https://playwright.dev/docs/next/chrome-extensions#testing
import { test as base } from "@playwright/test";

import { MisskeyPage, SoshalPage } from "../fediverse";

export const test = base.extend<{
  soshal: SoshalPage;
  misskey: MisskeyPage;
}>({
  soshal: async ({ context }, use) => {
    const page = await context.newPage();
    const soshal = new SoshalPage(page);
    await use(soshal);
    await page.close();
  },
  misskey: async ({ context }, use) => {
    const page = await context.newPage();
    const misskey = new MisskeyPage(page);
    await use(misskey);
    await page.close();
  },
});

export const expect = test.expect;
