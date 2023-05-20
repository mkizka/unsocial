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
    await soshal.postNote(content);

    // 他サーバーで確認
    await misskey.goto("/");
    await expect(misskey.getNote(content)).toBeVisible();

    // 他サーバーでいいね
    await misskey.like(content);

    // 自サーバーで同期を確認
    await soshal.page.reload();
    await soshal.page
      .locator("[data-testid=note-card]", { hasText: content })
      .getByTestId("note-card__link")
      .click();
    await soshal.page.waitForURL((url) => url.pathname.startsWith("/notes/"));
    await expect(
      soshal.page.locator("text=@e2e@misskey.localhost")
    ).toBeVisible();

    // 自サーバーで削除
    await soshal.delete(content);

    // 他サーバーで確認
    await expect(misskey.getNote(content)).not.toBeVisible();
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
    await soshal.like(content);

    // 他サーバーで同期を確認
    await expect(misskey.getNote(content)).toBeVisible();
    await expect(
      misskey.getNote(content).locator("button", { hasText: "1" })
    ).toBeVisible();

    // 他サーバーの投稿を削除
    await misskey.delete(content);

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
