// https://playwright.dev/docs/next/chrome-extensions#testing
import { test as base } from "@playwright/test";

import { MisskeyPage, SoshalPage } from "../fediverse";

export const test = base.extend<{
  soshal: SoshalPage;
  misskey: MisskeyPage;
}>({
  soshal: async ({ page }, use) => {
    await use(new SoshalPage(page));
  },
  misskey: async ({ page }, use) => {
    await use(new MisskeyPage(page));
  },
});

export const expect = test.expect;
