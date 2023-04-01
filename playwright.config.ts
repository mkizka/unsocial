import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  retries: 5,
  use: {
    baseURL: "https://soshal.localhost",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
});
