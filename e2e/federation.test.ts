import { test } from "@playwright/test";
import crypto from "crypto";

import {
  MastodonHandler,
  MisskeyHandler,
  MyhostSoshalHandler,
  RemoteSoshalHandler,
} from "./fediverse";
import type { FediverseHandler } from "./fediverse/base";

type RunTestParams = {
  from: FediverseHandler;
  to: FediverseHandler;
};

type Step = [string, () => Promise<void>];

// fromからtoへ投稿が連合するシナリオ
const runTest = async ({ from, to }: RunTestParams) => {
  const content = crypto.randomUUID();
  const steps: Step[] = [
    [
      `${from.domain}: ログイン`, //
      () => from.login(),
    ],
    [
      `${to.domain}: ログイン`, //
      () => to.login(),
    ],
    [
      `${from.domain}: ユーザーを確認`, //
      () => from.expectedUser(to.user),
    ],
    [
      `${to.domain}: ユーザーを確認`, //
      () => to.expectedUser(from.user),
    ],
    [
      `${to.domain}: ${from.user}をフォロー`, //
      () => to.followAndWait(from.user),
    ],
    [
      `${from.domain}: フォローされたことを確認`,
      () => from.expectFollowed(to.user),
    ],
    [
      `${to.domain}: フォローできたことを確認`,
      () => to.expectFollowing(from.user),
    ],
    [
      `${from.domain}: 投稿`, //
      () => from.postNoteAndWait(content),
    ],
    [
      `${to.domain}: 投稿が連合されたことを確認`, //
      () => to.expectPosted(content),
    ],
    [
      `${to.domain}: いいね`, //
      () => to.likeAndWait(content),
    ],
    [
      `${from.domain}: いいねされたことを確認`,
      () => from.expectLiked(content, to.user),
    ],
    [
      `${from.domain}: 投稿を削除`, //
      () => from.deleteAndWait(content),
    ],
    [
      `${to.domain}: 削除されたことを確認`, //
      () => to.expectDeleted(content),
    ],
    [
      `${to.domain}: フォロー解除`, //
      () => to.unfollowAndWait(from.user),
    ],
    [
      `${from.domain}: フォロー解除されたことを確認`,
      () => from.expectNotFollowed(to.user),
    ],
  ];
  for (const [label, action] of steps) {
    await test.step(label, action);
  }
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

  test("Soshal → Mastodon", async ({ page }) => {
    await runTest({
      from: new MyhostSoshalHandler(page),
      to: new MastodonHandler(page),
    });
  });

  test("Mastodon → Soshal", async ({ page }) => {
    await runTest({
      from: new MastodonHandler(page),
      to: new MyhostSoshalHandler(page),
    });
  });
});
