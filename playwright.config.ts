import type { PlaywrightTestConfig } from "@playwright/test";
import { defineConfig, devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  outputDir: "reports/.e2e",
  timeout: 90000,
  expect: {
    timeout: 2000,
  },
  reporter: [
    ["list", { printSteps: true }],
    ["html", { open: "never", outputFolder: "reports/e2e" }],
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        locale: "ja-JP",
      },
    },
  ],
  use: {
    ignoreHTTPSErrors: true,
    serviceWorkers: "block",
    video: "on",
    trace: "on",
  },
  webServer: {
    command: "pnpm e2e:server",
    port: 3000,
    stdout: "pipe",
    reuseExistingServer: !process.env.CI,
  },
};

export default defineConfig(config);
