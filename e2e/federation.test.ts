import { test } from "@playwright/test";
import crypto from "crypto";

import {
  MastodonHandler,
  MisskeyHandler,
  MyhostUnsocialHandler,
  RemoteUnsocialHandler,
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
  const replyContent = crypto.randomUUID();
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
      () => from.waitForUser(to.user),
    ],
    [
      `${to.domain}: ユーザーを確認`, //
      () => to.waitForUser(from.user),
    ],
    [
      `${to.domain}: ${from.user}をフォロー`, //
      () => to.follow(from.user),
    ],
    [
      `${from.domain}: フォローされたことを確認`,
      () => from.waitForFollowed(to.user),
    ],
    [
      `${to.domain}: フォローできたことを確認`,
      () => to.waitForFollowing(from.user),
    ],
    [
      `${from.domain}: 投稿`, //
      () => from.postNote(content),
    ],
    [
      `${to.domain}: 投稿が連合されたことを確認`, //
      () => to.waitForPosted(content),
    ],
    [
      `${to.domain}: リプライ`, //
      () => to.postReply(replyContent, content),
    ],
    [
      `${from.domain}: リプライが連合されたことを確認`, //
      () => from.waitForReplied(replyContent, content),
    ],
    [
      `${to.domain}: いいね`, //
      () => to.like(content),
    ],
    [
      `${from.domain}: いいねされたことを確認`,
      () => from.waitForLiked(content, to.user),
    ],
    [
      `${from.domain}: リポスト`, //
      () => to.repost(content),
    ],
    [
      `${to.domain}: いいね削除`, //
      () => to.unlike(content),
    ],
    [
      `${from.domain}: いいねが削除されたことを確認`,
      () => from.waitForNotLiked(content, to.user),
    ],
    [
      `${from.domain}: 投稿を削除`, //
      () => from.delete(content),
    ],
    [
      `${to.domain}: 投稿が削除されたことを確認`, //
      () => to.waitForDeleted(content),
    ],
    [
      `${to.domain}: フォロー解除`, //
      () => to.unfollow(from.user),
    ],
    [
      `${from.domain}: フォロー解除されたことを確認`,
      () => from.waitForNotFollowed(to.user),
    ],
    [
      `${to.domain}: フォロー解除できたことを確認`,
      () => to.waitForNotFollowing(from.user),
    ],
  ];
  // RsaSignature2017の動作を確認する
  if (from instanceof MyhostUnsocialHandler && to instanceof MastodonHandler) {
    steps.push(
      [
        `${to.domain}: ログアウト`, //
        () => to.logout(),
      ],
      [
        `${to.domain}: アカウントを削除`, //
        () => to.deleteAccount(),
      ],
      // TODO: RsaSignature2017をサポートする
      // [
      //   `${from.domain}: アカウントが削除されたことを確認`,
      //   () => from.waitForUserNotFound(to.user),
      // ],
    );
  }
  for (const [label, action] of steps) {
    await test.step(label, action);
  }
};

test.describe("Federation", () => {
  test("Unsocial", async ({ page }) => {
    await runTest({
      from: new MyhostUnsocialHandler(page),
      to: new RemoteUnsocialHandler(page),
    });
  });

  test("Misskey_1", async ({ page }) => {
    await runTest({
      from: new MyhostUnsocialHandler(page),
      to: new MisskeyHandler(page),
    });
  });

  test("Misskey_2", async ({ page }) => {
    await runTest({
      from: new MisskeyHandler(page),
      to: new MyhostUnsocialHandler(page),
    });
  });

  test("Mastodon_1", async ({ page }) => {
    await runTest({
      from: new MyhostUnsocialHandler(page),
      to: new MastodonHandler(page),
    });
  });

  test("Mastodon_2", async ({ page }) => {
    await runTest({
      from: new MastodonHandler(page),
      to: new MyhostUnsocialHandler(page),
    });
  });
});
