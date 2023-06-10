import { test } from "@playwright/test";
import crypto from "crypto";

import {
  MisskeyHandler,
  MyhostSoshalHandler,
  RemoteSoshalHandler,
} from "./fediverse";
import type { FediverseHandler } from "./fediverse/base";

test.describe.configure({ mode: "parallel" });
test.use({ storageState: "e2e/state.json" });

type RunTestParams = {
  from: FediverseHandler;
  to: FediverseHandler;
};

const runTest = async ({ from, to }: RunTestParams) => {
  const content = crypto.randomUUID();
  await to.followAndWait(from.user);
  await from.expectFollowed(to.user);
  await to.expectFollowing(from.user);
  await from.postNoteAndWait(content);
  await to.expectPosted(content);
  await to.likeAndWait(content);
  await from.expectLiked(content, to.user);
  await from.deleteAndWait(content);
  await to.expectDeleted(content);
  await to.unfollowAndWait(from.user);
  await from.expectNotFollowed(to.user);
};

test.describe("Federation", () => {
  test("Soshal → Soshal", async ({ page }) => {
    await runTest({
      from: new MyhostSoshalHandler(page),
      to: new RemoteSoshalHandler(page),
    });
  });

  test("Soshal → Misskey", async ({ page }) => {
    await runTest({
      from: new MyhostSoshalHandler(page),
      to: new MisskeyHandler(page),
    });
  });

  test("Misskey → Soshal", async ({ page }) => {
    await runTest({
      from: new MisskeyHandler(page),
      to: new MyhostSoshalHandler(page),
    });
  });
});
