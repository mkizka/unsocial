import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  retries: 3,
  projects: [
    { name: "setup", testMatch: "e2e/auth.setup.ts" },
    { name: "chromium", dependencies: ["setup"] },
  ],
  use: {
    baseURL: "https://soshal.localhost",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
});
