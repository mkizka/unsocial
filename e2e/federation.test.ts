import { test } from "@playwright/test";
import crypto from "crypto";

import { MisskeyHandler, SoshalHandler } from "./fediverse";

test.describe.configure({ mode: "parallel" });
test.use({ storageState: "e2e/state.json" });

const TIMEOUT_FOR_FEDERATION = 2000;

test.describe("Federation", () => {
  test("自サーバーの投稿", async ({ page }) => {
    const soshal = new SoshalHandler(page);
    const misskey = new MisskeyHandler(page);
    const content = crypto.randomUUID();
    await misskey.follow(soshal.user);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await soshal.expectFollowed(misskey.user);
    await misskey.expectFollowing(soshal.user);
    await soshal.postNote(content);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await misskey.expectPosted(content);
    await misskey.like(content);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await soshal.expectLiked(content);
    await soshal.delete(content);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await misskey.expectDeleted(content);
    await misskey.unfollow(soshal.user);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await soshal.expectNotFollowed(misskey.user);
  });

  test("他サーバーの投稿", async ({ page }) => {
    const soshal = new SoshalHandler(page);
    const misskey = new MisskeyHandler(page);
    const content = crypto.randomUUID();
    await soshal.follow(misskey.user);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await misskey.expectFollowed(soshal.user);
    await soshal.expectFollowing(misskey.user);
    await misskey.postNote(content);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await soshal.expectPosted(content);
    await soshal.like(content);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await misskey.expectLiked(content);
    await misskey.delete(content);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await soshal.expectDeleted(content);
    await soshal.follow(misskey.user);
    await page.waitForTimeout(TIMEOUT_FOR_FEDERATION);
    await misskey.expectNotFollowed(soshal.user);
  });
});
