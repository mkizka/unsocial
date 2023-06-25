import type { PlaywrightTestConfig } from "@playwright/test";
import { defineConfig, devices } from "@playwright/test";

const chromium = {
  ...devices["Desktop Chrome"],
  locale: "ja-JP",
};

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  outputDir: "reports/.e2e",
  reporter: [["html", { open: "never", outputFolder: "reports/e2e" }]],
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
    ignoreHTTPSErrors: true,
    serviceWorkers: "block",
    video: "on",
    trace: "on",
  },
  expect: {
    timeout: 10000,
  },
  webServer: {
    command: "pnpm e2e:server",
    port: 3000,
    stdout: "pipe",
    reuseExistingServer: !process.env.CI,
  },
};

export default defineConfig(config);
