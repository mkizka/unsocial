import { expect, test } from "@playwright/test";
import fs from "fs";

import { MisskeyHandler, SoshalHandler } from "./fediverse";

// 並列実行させるにあたってログイン時のメールを識別できないため、
// setupでログインして使いまわす
// https://playwright.dev/docs/auth
test("セットアップ", async ({ context }) => {
  if (fs.existsSync(`e2e/state.json`)) {
    return;
  }
  const soshal = new SoshalHandler(await context.newPage());
  const misskey = new MisskeyHandler(await context.newPage());
  await Promise.all([soshal.login(), misskey.login()]);
  await context.storageState({ path: `e2e/state.json` });

  // タイムアウト防止のために、先に自サーバーのユーザーをMisskeyに読み込ませておく
  await expect(async () => {
    await misskey.goto("/@test@soshal.localhost");
    await expect(
      misskey.page.locator("text=@test@soshal.localhost").first()
    ).toBeVisible();
  }).toPass();
});
