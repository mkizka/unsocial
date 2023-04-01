import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 5000,
  use: {
    baseURL: "https://soshal.localhost",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
});
