import { test } from "@playwright/test";
import crypto from "crypto";
import { setTimeout } from "timers/promises";

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

  // Mastodon <- Misskey/Unsocial というフォロー関係の時に、
  // Mastodonが配送して来るMisskeyのリプライをUnsocialが受け取れることをテストするシナリオ
  test("All", async ({ page }) => {
    const content = crypto.randomUUID();
    const replyContent = crypto.randomUUID();
    const mastodon = new MastodonHandler(page);
    const misskey = new MisskeyHandler(page);
    const unsocial = new MyhostUnsocialHandler(page);
    const steps: Step[] = [
      [
        `3サーバーにログイン`,
        async () => {
          await mastodon.login();
          await misskey.login();
          await unsocial.login();
        },
      ],
      [
        "1. UnsocialがMastodonをフォロー",
        async () => {
          await unsocial.waitForUser(mastodon.user);
          await mastodon.waitForUser(unsocial.user);
          await unsocial.follow(mastodon.user);
        },
      ],
      [
        "2. MisskeyがMastodonをフォロー",
        async () => {
          await misskey.waitForUser(mastodon.user);
          await mastodon.waitForUser(misskey.user);
          await misskey.follow(mastodon.user);
        },
      ],
      [
        "3. Mastodonが投稿、Misskey/Unsocialに配送",
        async () => {
          await mastodon.postNote(content);
          await misskey.waitForPosted(content);
          await unsocial.waitForPosted(content);
        },
      ],
      [
        "4. MisskeyがMastodonにリプライ",
        async () => {
          await misskey.postReply(replyContent, content);
          await mastodon.waitForReplied(replyContent, content);
        },
      ],
      [
        "5. Mastodonから送られてきたRsaSignature2017を検証",
        async () => {
          await unsocial.waitForPosted(content);
          await setTimeout(5000);
          throw new Error("Not implemented");
        },
      ],
    ];
    for (const [label, action] of steps) {
      await test.step(label, action);
    }
  });
});
