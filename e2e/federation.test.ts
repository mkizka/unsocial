import { test } from "@playwright/test";
import crypto from "crypto";

import {
  MisskeyHandler,
  MyhostSoshalHandler,
  RemoteSoshalHandler,
} from "./fediverse";
import type { FediverseHandler } from "./fediverse/base";

test.describe.configure({ mode: "parallel" });

type RunTestParams = {
  from: FediverseHandler;
  to: FediverseHandler;
};

// fromからtoへ投稿が連合するシナリオ
const runTest = async ({ from, to }: RunTestParams) => {
  const content = crypto.randomUUID();
  // ログイン
  await from.login();
  // リモートにログイン
  await to.login();
  // リモートからフォロー
  await to.followAndWait(from.user);
  // フォローされたことを確認
  await from.expectFollowed(to.user);
  // リモートでフォローできたことを確認
  await to.expectFollowing(from.user);
  // 投稿
  await from.postNoteAndWait(content);
  // リモートで投稿を確認
  await to.expectPosted(content);
  // リモートからいいね
  await to.likeAndWait(content);
  // いいねされたことを確認
  await from.expectLiked(content, to.user);
  // 投稿を削除
  await from.deleteAndWait(content);
  // リモートで削除されたことを確認
  await to.expectDeleted(content);
  // リモートからフォロー解除
  await to.unfollowAndWait(from.user);
  // フォロー解除されたことを確認
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
