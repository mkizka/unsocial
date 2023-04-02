import { expect, test } from "@playwright/test";

test.describe("WebFinger", () => {
  test("他サーバーのアカウントを表示できる", async ({ page }) => {
    const response = await page.goto("/@e2e@misskey.localhost");
    expect(response?.status()).toBe(200);
  });

  test("他サーバーの存在しないアカウントには404を返す", async ({ page }) => {
    const response = await page.goto("/@notfound@misskey.localhost");
    expect(response?.status()).toBe(404);
  });

  test("存在しないサーバーのアカウントには404を返す", async ({ page }) => {
    const response = await page.goto("/@e2e@notfound.localhost");
    expect(response?.status()).toBe(404);
  });
});
