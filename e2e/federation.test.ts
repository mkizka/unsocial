import { expect, test } from "@playwright/test";

test("他サーバーのアカウントを表示できる", async ({ page }) => {
  const response = await page.goto(
    "https://soshal.localhost/@e2e@misskey.localhost"
  );
  expect(response?.status()).toBe(200);
});
