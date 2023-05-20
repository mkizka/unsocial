import fs from "fs";

import { expect, misskey, soshal, test } from "./utils";

// 並列実行させるにあたってログイン時のメールを識別できないため、
// setupでログインして使いまわす
// https://playwright.dev/docs/auth
test("セットアップ", async ({ page: page1, context }) => {
  if (fs.existsSync(`e2e/state.json`)) {
    return;
  }
  const page2 = await context.newPage();
  await Promise.all([soshal.login(page1), misskey.login(page2)]);
  await context.storageState({ path: `e2e/state.json` });

  // タイムアウト防止のために、先に自サーバーのユーザーをMisskeyに読み込ませておく
  await misskey.goto(page2, "/@test@soshal.localhost");
  await expect(
    page2.locator("text=@test@soshal.localhost").first()
  ).toBeVisible({ timeout: 20000 });
});
