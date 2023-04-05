import { expect, test } from "@playwright/test";
import crypto from "crypto";

import { soshal } from "./utils";

test.describe.configure({ mode: "parallel" });

test.use({ storageState: "e2e/state.json" });

test.describe("Federation", () => {
  test.describe("Note", () => {
    test("作成 → 削除が同期される", async ({ page }) => {
      // 投稿
      await page.goto("/");
      const content = `投稿テスト${crypto.randomUUID()}`;
      const note = await soshal.postNote(page, content);

      // Misskey側で確認
      await page.goto("https://misskey.localhost");
      await page.locator("button", { hasText: "Global" }).click();
      await expect(page.locator(`text=${content}`)).toBeVisible();

      // 削除
      await page.goto("/");
      await note.getByTestId("delete-button").click();

      // Misskey側で確認
      await page.goto("https://misskey.localhost");
      await page.locator("button", { hasText: "Global" }).click();
      await expect(page.locator(`text=${content}`)).not.toBeVisible();
    });
  });

  test.describe("Follow", () => {
    test("フォロー → フォロー解除が同期される", async ({ page }) => {
      // フォロー
      await page.goto("/@e2e@misskey.localhost");
      await page.getByTestId("follow-button").click();

      // Misskey側で確認
      await page.goto("https://misskey.localhost/@e2e/followers");
      const testAccountInMisskey = page.locator("text=@test@soshal.localhost");
      await expect(testAccountInMisskey).toBeVisible();

      // フォロー解除
      await page.goto("/@e2e@misskey.localhost");
      await page.getByTestId("follow-button").click();

      // Misskey側で確認
      await page.goto("https://misskey.localhost/@e2e/followers");
      await expect(testAccountInMisskey).not.toBeVisible();
    });
  });
});
