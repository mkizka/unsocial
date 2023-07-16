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
  mutate: [
    "src/**/*.ts",
    "src/app/.well-known/**/*.ts",
    "!src/**/*.d.ts",
    // TODO: サーバーコンポーネントがテスト出来るようになったら消す
    "!src/**/*.server.ts",
    "!src/**/*.spec.ts",
    "!src/app/.well-known/**/*.spec.ts",
    "!src/**/__fixtures__/**/*.ts",
  ],
  // 権限エラーになることがあるため
  ignorePatterns: ["docker"],
  checkers: ["typescript"],
  plugins: [
    "@stryker-mutator/jest-runner",
    "@stryker-mutator/typescript-checker",
  ],
};
export default config;
