import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  retries: 3,
  timeout: 5 * 60 * 1000,
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
    video: process.env.CI ? "retain-on-failure" : "off",
    ignoreHTTPSErrors: true,
  },
});
