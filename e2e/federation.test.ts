import { test } from "@playwright/test";
import crypto from "crypto";

import { MisskeyHandler, SoshalHandler } from "./fediverse";
import type { FediverseHandler } from "./fediverse/base";

test.describe.configure({ mode: "parallel" });
test.use({ storageState: "e2e/state.json" });

type RunTestParams = {
  myhost: FediverseHandler;
  remote: FediverseHandler;
};

const runTest = async ({ myhost, remote }: RunTestParams) => {
  const content = crypto.randomUUID();
  await remote.followAndWait(myhost.user);
  await myhost.expectFollowed(remote.user);
  await remote.expectFollowing(myhost.user);
  await myhost.postNoteAndWait(content);
  await remote.expectPosted(content);
  await remote.likeAndWait(content);
  await myhost.expectLiked(content);
  await myhost.deleteAndWait(content);
  await remote.expectDeleted(content);
  await remote.unfollowAndWait(myhost.user);
  await myhost.expectNotFollowed(remote.user);
};

test.describe("Federation", () => {
  // test("Soshal → Soshal", async ({ page }) => {
  //   await runTest({
  //     myhost: new SoshalHandler(page),
  //     remote: new RemoteSoshalHandler(page),
  //   });
  // });

  test("Soshal → Misskey", async ({ page }) => {
    await runTest({
      myhost: new SoshalHandler(page),
      remote: new MisskeyHandler(page),
    });
  });

  test("Misskey → Soshal", async ({ page }) => {
    await runTest({
      myhost: new MisskeyHandler(page),
      remote: new SoshalHandler(page),
    });
  });
});
