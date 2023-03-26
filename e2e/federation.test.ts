import { expect, test } from "@playwright/test";

test("他サーバーのアカウントを表示できる", async ({ page }) => {
  const response = await page.goto("/@e2e@misskey.localhost");
  expect(response?.status()).toBe(200);
});
