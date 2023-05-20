import type { PlaywrightTestConfig } from "@playwright/test";
import { defineConfig, devices } from "@playwright/test";

const chromium = {
  ...devices["Desktop Chrome"],
  locale: "ja-JP",
};

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  projects: [
    {
      name: "setup",
      use: chromium,
      testMatch: "e2e/auth.setup.ts",
    },
    {
      name: "chromium",
      use: chromium,
      dependencies: ["setup"],
    },
  ],
  use: {
    baseURL: "https://soshal.localhost",
    ignoreHTTPSErrors: true,
    serviceWorkers: "block",
  },
};

if (process.env.CI) {
  config.retries = 3;
  config.timeout = 5 * 60 * 1000;
  config.use!.video = "on-first-retry";
}

export default defineConfig(config);
