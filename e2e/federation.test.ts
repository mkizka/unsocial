import { expect, test } from "@playwright/test";
import crypto from "crypto";

import { misskey, soshal } from "./utils";

test.describe.configure({ mode: "parallel" });

test.use({ storageState: "e2e/state.json" });

test.describe("Federation", () => {
  test("自サーバーの投稿", async ({ page }) => {
    // 自サーバーで投稿
    await page.goto("/");
    const content = crypto.randomUUID();
    const myhostNote = await soshal.postNote(page, content);

    // 他サーバーで確認
    await misskey.showGTL(page);
    const remoteNote = page.locator("article", { hasText: content });
    await expect(remoteNote).toBeVisible();

    // 他サーバーでいいね
    await remoteNote
      .locator("button", { has: page.locator(".ti-plus") })
      .click();
    await page.locator(".emojis button").first().click();

    // 自サーバーで同期を確認
    await page.goto("/");
    await myhostNote.getByTestId("note-card__link").click();
    await page.waitForURL((url) => url.pathname.startsWith("/notes/"));
    await expect(page.locator("text=@e2e@misskey.localhost")).toBeVisible();

    // 自サーバーで削除
    await page.goto("/");
    await myhostNote.getByTestId("delete-button").click();

    // 他サーバーで確認
    await misskey.showGTL(page);
    await expect(page.locator(`text=${content}`)).not.toBeVisible();
  });

  test("他サーバーの投稿", async ({ page }) => {
    // 他サーバーのユーザーをフォロー
    await page.goto("/@e2e@misskey.localhost");
    await page.getByTestId("follow-button").click();

    // 他サーバーで同期を確認
    await page.goto("https://misskey.localhost/@e2e/followers");
    const testAccountInMisskey = page.locator("text=@test@soshal.localhost");
    await expect(testAccountInMisskey).toBeVisible();

    // 自サーバーで同期を確認
    await page.goto("/@e2e@misskey.localhost");
    await expect(page.getByTestId("follow-button")).toHaveText("フォロー中");

    // 他サーバーで投稿
    await page.goto("https://misskey.localhost");
    const content = crypto.randomUUID();
    await misskey.postNote(page, content);

    // 自サーバーで同期を確認
    await page.goto("/");
    const myhostNote = page.locator("[data-testid=note-card]", {
      hasText: content,
    });
    await expect(myhostNote).toBeVisible();

    // 自サーバーでいいね
    await myhostNote.getByTestId("like-button").click();

    // 他サーバーで同期を確認
    await misskey.showGTL(page);
    const remoteNote = page.locator("article", { hasText: content });
    await expect(remoteNote.locator("button", { hasText: "1" })).toBeVisible();

    // 他サーバーの投稿を削除
    await remoteNote
      .locator("button", { has: page.locator(".ti-dots") })
      .click();
    await page.locator("button", { hasText: "削除" }).last().click();
    await page.locator("button", { hasText: "OK" }).click();
    await expect(remoteNote).not.toBeVisible();

    // 自サーバーで同期を確認
    await page.goto("/");
    await expect(myhostNote).not.toBeVisible();

    // 他サーバーのユーザーをアンフォロー
    await page.goto("/@e2e@misskey.localhost");
    await page.getByTestId("follow-button").click();

    // 他サーバーで同期を確認
    await page.goto("https://misskey.localhost/@e2e/followers");
    await expect(testAccountInMisskey).not.toBeVisible();
  });
});
