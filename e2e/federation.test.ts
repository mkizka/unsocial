import { expect, test } from "@playwright/test";

import { login, loginMisskey } from "./utils";

test.describe.configure({ mode: "parallel" });

test.describe("Federation", () => {
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

  test("作成したノートが他サーバーに連合される", async ({ page }) => {
    await login(page);
    await page.goto("/");

    const content = `投稿テスト ${new Date().getTime()}`;
    // まれに連合されないことがあるので、3回投稿する
    for (const i of [1, 2, 3]) {
      await page.getByTestId("note-form__textarea").fill(`${content} ${i}`);
      await page.getByTestId("note-form__button").click();
      await page.waitForTimeout(1000);
    }

    await loginMisskey(page);
    await page.locator(".x5vNM button").nth(3).click();
    await page.waitForTimeout(500);
    await expect(page.locator(".x48yH").first()).toHaveText(
      new RegExp(`^${content} \\d$`)
    );
  });
});
