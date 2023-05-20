// https://playwright.dev/docs/next/chrome-extensions#testing
import { test as base } from "@playwright/test";

import { MisskeyPage, SoshalPage } from "../fediverse";

export const test = base.extend<{
  soshal: SoshalPage;
  misskey: MisskeyPage;
}>({
  soshal: async ({ context }, use) => {
    const page = await context.newPage();
    await use(new SoshalPage(page));
  },
  misskey: async ({ context }, use) => {
    const page = await context.newPage();
    await use(new MisskeyPage(page));
  },
});

export const expect = test.expect;
