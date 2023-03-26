import { expect, test } from "@playwright/test";

test("他サーバーのアカウントを表示できる", async ({ page }) => {
  // Misskeyにアカウントを作成する
  await page.goto("https://misskey.localhost");
  await page.click("[data-cy-signup]");
  await page.locator("[data-cy-signup-username] input").fill("e2e");
  await page.locator("[data-cy-signup-password] input").fill("e2e");
  await page.locator("[data-cy-signup-password-retype] input").fill("e2e");
  await page.locator(".tou").click();
  await page.locator("[data-cy-signup-submit]").click();

  // SoshalにアクセスしてMisskeyのアカウントを表示する
  const response = await page.goto(
    "https://soshal.localhost/@e2e@misskey.localhost"
  );
  expect(response?.status()).toBe(200);
});
