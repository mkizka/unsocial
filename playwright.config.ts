import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: {
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
});
