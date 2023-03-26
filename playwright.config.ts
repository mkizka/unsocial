import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: "http://localhost:3000",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
});
