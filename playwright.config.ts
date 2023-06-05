import type { PlaywrightTestConfig } from "@playwright/test";
import { defineConfig, devices } from "@playwright/test";

const chromium = {
  ...devices["Desktop Chrome"],
  locale: "ja-JP",
};

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  outputDir: "reports/.e2e",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "reports/e2e" }],
  ],
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
    video: "on",
    trace: "on",
  },
  webServer: {
    command: "NODE_EXTRA_CA_CERTS=./docker/mkcert/rootCA.pem pnpm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
};

if (process.env.CI) {
  config.retries = 3;
  config.timeout = 90000;
}

export default defineConfig(config);
