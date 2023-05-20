import fs from "fs";

import { expect, test } from "./utils";

// 並列実行させるにあたってログイン時のメールを識別できないため、
// setupでログインして使いまわす
// https://playwright.dev/docs/auth
test("セットアップ", async ({ misskey, soshal, context }) => {
  if (fs.existsSync(`e2e/state.json`)) {
    return;
  }
  await Promise.all([soshal.login(), misskey.login()]);
  await context.storageState({ path: `e2e/state.json` });

  // タイムアウト防止のために、先に自サーバーのユーザーをMisskeyに読み込ませておく
  await misskey.goto("/@test@soshal.localhost");
  await expect(
    misskey.page.locator("text=@test@soshal.localhost").first()
  ).toBeVisible({ timeout: 20000 });
});
