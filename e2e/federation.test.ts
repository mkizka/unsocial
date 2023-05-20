import crypto from "crypto";

import { test } from "./utils";

test.describe.configure({ mode: "parallel" });
test.use({ storageState: "e2e/state.json" });

test.describe("Federation", () => {
  test("自サーバーの投稿", async ({ soshal, misskey }) => {
    const content = crypto.randomUUID();
    await soshal.postNote(content);
    await misskey.expectPosted(content);
    await misskey.like(content);
    await soshal.expectLiked(content);
    await soshal.delete(content);
    await misskey.expectDeleted(content);
  });

  test("他サーバーの投稿", async ({ soshal, misskey }) => {
    const content = crypto.randomUUID();
    await soshal.follow(misskey.user);
    await misskey.expectFollowed(soshal.user);
    await soshal.expectFollowing(misskey.user);
    await misskey.postNote(content);
    await soshal.expectPosted(content);
    await soshal.like(content);
    await misskey.expectLiked(content);
    await misskey.delete(content);
    await soshal.expectDeleted(content);
    await soshal.follow(misskey.user);
    await misskey.expectNotFollowed(soshal.user);
  });
});
