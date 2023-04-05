import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  retries: 3,
  projects: [
    {
      name: "setup",
      use: {
        locale: "ja-JP",
      },
      testMatch: "e2e/auth.setup.ts",
    },
    {
      name: "chromium",
      use: {
        locale: "ja-JP",
      },
      dependencies: ["setup"],
    },
  ],
  use: {
    baseURL: "https://soshal.localhost",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
});
