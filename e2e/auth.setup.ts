import { chromium, expect, test } from "@playwright/test";
import fs from "fs";

import { misskey, soshal } from "./utils";

// 並列実行させるにあたってログイン時のメールを識別できないため、
// setupでログインして使いまわす
// https://playwright.dev/docs/auth
test("セットアップ", async () => {
  if (fs.existsSync(`e2e/state.json`)) {
    return;
  }
  const browser = await chromium.launch();
  const context = await browser.newContext({ locale: "ja-JP" });
  const page1 = await context.newPage();
  const page2 = await context.newPage();
  await Promise.all([soshal.login(page1), misskey.login(page2)]);
  await context.storageState({ path: `e2e/state.json` });

  // タイムアウト防止のために、先に自サーバーのユーザーをMisskeyに読み込ませておく
  const page3 = await context.newPage();
  await page3.goto("https://misskey.localhost/@test@soshal.localhost");
  await expect(page3.locator("text=@test@soshal.localhost")).toBeVisible();
  await browser.close();
});
