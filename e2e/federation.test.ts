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
  await test.step(`${from.domain}: ログイン`, () => from.login());
  await test.step(`${to.domain}: ログイン`, () => to.login());
  await test.step(`${from.domain}: ユーザーを確認`, () =>
    from.expectedUser(to.user));
  await test.step(`${to.domain}: ユーザーを確認`, () =>
    to.expectedUser(from.user));
  await test.step(`${to.domain}: ${from.user}をフォロー`, () =>
    to.followAndWait(from.user));
  await test.step(`${from.domain}: フォローされたことを確認`, () =>
    from.expectFollowed(to.user));
  await test.step(`${to.domain}: フォローできたことを確認`, () =>
    to.expectFollowing(from.user));
  await test.step(`${from.domain}: 投稿`, () => from.postNoteAndWait(content));
  await test.step(`${to.domain}: 投稿が連合されたことを確認`, () =>
    to.expectPosted(content));
  await test.step(`${to.domain}: いいね`, () => to.likeAndWait(content));
  await test.step(`${from.domain}: いいねされたことを確認`, () =>
    from.expectLiked(content, to.user));
  await test.step(`${from.domain}: 投稿を削除`, () =>
    from.deleteAndWait(content));
  await test.step(`${to.domain}: 削除されたことを確認`, () =>
    to.expectDeleted(content));
  await test.step(`${to.domain}: フォロー解除`, () =>
    to.unfollowAndWait(from.user));
  await test.step(`${from.domain}: フォロー解除されたことを確認`, () =>
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
