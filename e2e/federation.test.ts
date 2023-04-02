import { expect, test } from "@playwright/test";

import { login, loginMisskey } from "./utils";

test.describe("Federation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("作成したノートが他サーバーに連合される", async ({ page }) => {
    // まれに連合されないことがあるので3回投稿
    const content = `投稿テスト ${new Date().getTime()}`;
    for (const i of [1, 2, 3]) {
      await page.getByTestId("note-form__textarea").fill(`${content} ${i}`);
      await page.getByTestId("note-form__button").click();
      await page.waitForTimeout(500);
    }
    await loginMisskey(page);
    await page.locator(".x5vNM button").nth(3).click();
    await expect(page.locator(".x48yH").first()).toHaveText(
      new RegExp(content)
    );
  });

  test("削除したノートが他サーバーから削除される", async ({ page }) => {
    // getByTestIdは複数要素がある場合にエラーになるのでlocatorを使う
    const deleteButton = page.locator("[data-testid=delete-button]");
    // countが出現を待たないようなので一つ以上の出現を待つ
    await deleteButton.first().waitFor();
    for (const _ of [...new Array(await deleteButton.count()).keys()]) {
      await deleteButton.first().click();
      await page.waitForTimeout(500);
    }
    await loginMisskey(page);
    await page.locator(".x5vNM button").nth(3).click();
    await expect(page.locator(".empty")).toBeVisible();
  });
});
