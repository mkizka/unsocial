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
  await test.step("from: ログイン", () => from.login());
  await test.step("to: ログイン", () => to.login());
  await test.step("from: ユーザーを確認", () => from.expectedUser(to.user));
  await test.step("to: ユーザーを確認", () => to.expectedUser(from.user));
  await test.step("to: フォロー", () => to.followAndWait(from.user));
  await test.step("from: フォローされたことを確認", () =>
    from.expectFollowed(to.user));
  await test.step("to: フォローできたことを確認", () =>
    to.expectFollowing(from.user));
  await test.step("from: 投稿", () => from.postNoteAndWait(content));
  await test.step("to: 投稿が連合されたことを確認", () =>
    to.expectPosted(content));
  await test.step("to: いいね", () => to.likeAndWait(content));
  await test.step("from: いいねされたことを確認", () =>
    from.expectLiked(content, to.user));
  await test.step("from: 投稿を削除", () => from.deleteAndWait(content));
  await test.step("to: 削除されたことを確認", () => to.expectDeleted(content));
  await test.step("to: フォロー解除", () => to.unfollowAndWait(from.user));
  await test.step("from: フォロー解除されたことを確認", () =>
    from.expectNotFollowed(to.user));
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
