import crypto from "crypto";

import { expect, test } from "./utils";

test.describe.configure({ mode: "parallel" });
test.use({ storageState: "e2e/state.json" });

const TIMEOUT_FOR_FEDERATION = 500;

test.describe("Federation", () => {
  test("自サーバーの投稿", async ({ soshal, misskey, context }) => {
    // 自サーバーで投稿
    await soshal.goto("/");
    const content = crypto.randomUUID();
    const myhostNote = await soshal.postNote(content);
    await soshal.page.waitForTimeout(TIMEOUT_FOR_FEDERATION);

    // 他サーバーで確認
    await misskey.showGTL();
    const remoteNote = misskey.page.locator("article", { hasText: content });
    await expect(remoteNote).toBeVisible();

    // 他サーバーでいいね
    await remoteNote
      .locator("button", { has: misskey.page.locator(".ti-plus") })
      .click();
    await misskey.page.locator(".emojis button").first().click();
    await misskey.page.waitForTimeout(TIMEOUT_FOR_FEDERATION);

    // 自サーバーで同期を確認
    await soshal.goto("/");
    await myhostNote.getByTestId("note-card__link").click();
    await soshal.page.waitForURL((url) => url.pathname.startsWith("/notes/"));
    await expect(
      soshal.page.locator("text=@e2e@misskey.localhost")
    ).toBeVisible();

    // 自サーバーで削除
    await soshal.goto("/");
    await myhostNote.getByTestId("delete-button").click();
    await soshal.page.waitForTimeout(TIMEOUT_FOR_FEDERATION);

    // 他サーバーで確認
    await misskey.showGTL();
    await expect(soshal.page.locator(`text=${content}`)).not.toBeVisible();
  });

  test("他サーバーの投稿", async ({ soshal, misskey }) => {
    // 他サーバーのユーザーをフォロー
    await soshal.goto("/@e2e@misskey.localhost");
    await soshal.page.getByTestId("follow-button").click();
    await soshal.page.waitForTimeout(TIMEOUT_FOR_FEDERATION);

    // 他サーバーで同期を確認
    await misskey.goto("/@e2e/followers");
    const testAccountInMisskey = misskey.page.locator(
      "text=@test@soshal.localhost"
    );
    await expect(testAccountInMisskey).toBeVisible();

    // 自サーバーで同期を確認
    await soshal.goto("/@e2e@misskey.localhost");
    await expect(soshal.page.getByTestId("follow-button")).toHaveText(
      "フォロー中"
    );

    // 他サーバーで投稿
    await misskey.goto("/");
    const content = crypto.randomUUID();
    await misskey.postNote(content);
    await misskey.page.waitForTimeout(TIMEOUT_FOR_FEDERATION);

    // 自サーバーで同期を確認
    await soshal.page.goto("/");
    const myhostNote = soshal.page.locator("[data-testid=note-card]", {
      hasText: content,
    });
    await expect(myhostNote).toBeVisible();

    // 自サーバーでいいね
    await myhostNote.getByTestId("like-button").click();
    await soshal.page.waitForTimeout(TIMEOUT_FOR_FEDERATION);

    // 他サーバーで同期を確認
    await misskey.showGTL();
    const remoteNote = misskey.page.locator("article", { hasText: content });
    await expect(remoteNote.locator("button", { hasText: "1" })).toBeVisible();

    // 他サーバーの投稿を削除
    await remoteNote
      .locator("button", { has: misskey.page.locator(".ti-dots") })
      .click();
    await misskey.page.locator("button", { hasText: "削除" }).last().click();
    await misskey.page.locator("button", { hasText: "OK" }).click();
    await misskey.page.waitForTimeout(TIMEOUT_FOR_FEDERATION);

    // 自サーバーで同期を確認
    await soshal.goto("/");
    await expect(myhostNote).not.toBeVisible();

    // 他サーバーのユーザーをアンフォロー
    await soshal.goto("/@e2e@misskey.localhost");
    await soshal.page.getByTestId("follow-button").click();
    await soshal.page.waitForTimeout(TIMEOUT_FOR_FEDERATION);

    // 他サーバーで同期を確認
    await misskey.goto("/e2e/followers");
    await expect(testAccountInMisskey).not.toBeVisible();
  });
});
