import test from "@playwright/test";
import fs from "fs";

import { login, loginMisskey } from "./utils";

// 並列実行させるにあたってログイン時のメールを識別できないため、
// setupでログインして使いまわす
// https://playwright.dev/docs/auth
test("setup", async ({ page }) => {
  if (fs.existsSync(`e2e/state.json`)) {
    return;
  }
  await login(page);
  await loginMisskey(page);
  await page.context().storageState({ path: `e2e/state.json` });
});
