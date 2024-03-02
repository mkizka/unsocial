import { test } from "@playwright/test";
import crypto from "crypto";

import { MisskeyHandler, MyhostUnsocialHandler } from "./fediverse";
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
    // [
    //   `${from.domain}: ユーザーを確認`, //
    //   () => from.waitForUser(to.user),
    // ],
    // [
    //   `${to.domain}: ユーザーを確認`, //
    //   () => to.waitForUser(from.user),
    // ],
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
  test("Relay_1", async ({ page }) => {
    await runTest({
      from: new MisskeyHandler(page),
      to: new MyhostUnsocialHandler(page),
    });
  });
});
