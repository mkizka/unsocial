// https://playwright.dev/docs/next/chrome-extensions#testing
import { test as base } from "@playwright/test";

import { MisskeyPage, SoshalPage } from "../fediverse";

export const test = base.extend<{
  soshal: SoshalPage;
  misskey: MisskeyPage;
}>({
  soshal: async ({ page }, use) => {
    const soshal = new SoshalPage(page);
    await use(soshal);
  },
  misskey: async ({ page }, use) => {
    const misskey = new MisskeyPage(page);
    await use(misskey);
  },
});

export const expect = test.expect;
