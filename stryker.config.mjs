// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "pnpm",
  reporters: ["progress", "html", "json"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  incremental: true,
  incrementalFile: "reports/mutation/stryker-incremental.json",
  timeoutMS: 30000,
  maxTestRunnerReuse: 20,
  ignoreStatic: true,
  cleanTempDir: "always",
  mutate: [
    "app/**/*.ts",
    "app/.well-known/**/*.ts",
    "!app/**/*.d.ts",
    "!app/**/*.spec.ts",
    "!app/**/*.stories.ts",
    "!app/.well-known/**/*.spec.ts",
    "!app/**/__fixtures__/**/*.ts",
  ],
  // 権限エラーになることがあるため
  ignorePatterns: ["docker"],
  plugins: ["@stryker-mutator/jest-runner"],
};

if (process.env.CI) {
  config.concurrency = 3;
}

export default config;
