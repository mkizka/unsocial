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

const setupRelayServer = async (
  fediverse: FediverseHandler,
  relayServer: string,
) => {
  const steps: Step[] = [
    [
      `${fediverse.domain}: ログイン`, //
      () => fediverse.login(),
    ],
    [
      `${fediverse.domain}: リレーサーバーを登録`,
      () => fediverse.registerRelayServer(relayServer),
    ],
  ];
  for (const [label, action] of steps) {
    await test.step(label, action);
  }
};

// fromの投稿がtoにリレーされるテスト
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
      `${from.domain}: 投稿`, //
      () => from.postNote(content),
    ],
    [
      `${to.domain}: 投稿がリレーされたことを確認`,
      () => to.waitForPosted(content),
    ],
  ];
  for (const [label, action] of steps) {
    await test.step(label, action);
  }
};

test.describe("All", () => {
  test("Setup", async ({ page }) => {
    const relayServer = "https://relay.localhost/inbox";
    await setupRelayServer(new MisskeyHandler(page), relayServer);
    await setupRelayServer(new MastodonHandler(page), relayServer);
    await setupRelayServer(new MyhostUnsocialHandler(page), relayServer);
  });

  test("Relay_1", async ({ page }) => {
    await runTest({
      from: new MisskeyHandler(page),
      to: new MyhostUnsocialHandler(page),
    });
  });

  test("Relay_2", async ({ page }) => {
    await runTest({
      from: new MastodonHandler(page),
      to: new MyhostUnsocialHandler(page),
    });
  });
});
