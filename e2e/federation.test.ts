import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import crypto from "crypto";

const postNote = async (page: Page, content: string) => {
  await page.getByTestId("note-form__textarea").fill(content);
  await page.getByTestId("note-form__button").click();
  const note = page.locator("[data-testid=note-card]", {
    has: page.locator(`text=${content}`),
  });
  await expect(note).toBeVisible();
  return note;
};

test.describe.configure({ mode: "parallel" });

test.describe("Federation", () => {
  test.use({ storageState: "e2e/state.json" });

  test("作成したノートが他サーバーに連合される", async ({ page }) => {
    page.goto("/");
    const content = `投稿テスト${crypto.randomUUID()}`;
    await postNote(page, content);

    page.goto("https://misskey.localhost");
    await page.locator(".x5vNM button").nth(3).click();
    await expect(page.locator(`text=${content}`)).toBeVisible();
  });

  test("削除したノートが他サーバーから削除される", async ({ page }) => {
    page.goto("/");
    const content = `削除テスト${crypto.randomUUID()}`;
    const note = await postNote(page, content);
    // Misskey側の保存処理を待つ
    await page.waitForTimeout(1000);
    await note.getByTestId("delete-button").click();

    page.goto("https://misskey.localhost");
    await page.locator(".x5vNM button").nth(3).click();
    await expect(page.locator(`text=${content}`)).not.toBeVisible();
  });
});
