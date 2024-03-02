import { test } from "@playwright/test";
import crypto from "crypto";

import {
  MastodonHandler,
  MisskeyHandler,
  MyhostUnsocialHandler,
} from "./fediverse";
import type { FediverseHandler } from "./fediverse/base";

type RunTestParams = {
  from: FediverseHandler;
  to: FediverseHandler;
};

type Step = [string, () => Promise<void>];

// fromの投稿がtoにリレーされるテスト
const runTest = async ({ from, to }: RunTestParams) => {
  const content = crypto.randomUUID();
  const relayServer = "https://relay.localhost/inbox";
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
      `${from.domain}: リレーサーバーを登録`,
      () => from.registerRelayServer(relayServer),
    ],
    [
      `${to.domain}: リレーサーバーを登録`,
      () => to.registerRelayServer(relayServer),
    ],
    [
      `${from.domain}: 投稿`, //
      () => from.postNote(content),
    ],
    [
      `${to.domain}: 投稿がリレーされたことを確認`, //
      () => to.waitForPosted(content),
    ],
  ];
  for (const [label, action] of steps) {
    await test.step(label, action);
  }
};

test.describe("All", () => {
  test("Misskey → Unsocial", async ({ page }) => {
    await runTest({
      from: new MisskeyHandler(page),
      to: new MyhostUnsocialHandler(page),
    });
  });

  test("Mastodon → Unsocial", async ({ page }) => {
    await runTest({
      from: new MastodonHandler(page),
      to: new MyhostUnsocialHandler(page),
    });
  });
});
