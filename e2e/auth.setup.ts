import { test } from "@playwright/test";
import fs from "fs";

import { misskey, soshal } from "./utils";

// 並列実行させるにあたってログイン時のメールを識別できないため、
// setupでログインして使いまわす
// https://playwright.dev/docs/auth
test("setup", async ({ page }) => {
  if (fs.existsSync(`e2e/state.json`)) {
    return;
  }
  await soshal.login(page);
  await misskey.login(page);
  await page.context().storageState({ path: `e2e/state.json` });

  // タイムアウト防止のために、先に自サーバーのユーザーをMisskeyに読み込ませておく
  await page.goto("https://misskey.localhost/@test@soshal.localhost");
  await page.waitForTimeout(5000);
});
