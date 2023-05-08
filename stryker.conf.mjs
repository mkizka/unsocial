// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "pnpm",
  reporters: ["progress", "html", "json"],
  testRunner: "jest",
  coverageAnalysis: "perTest",
  incremental: true,
  timeoutMS: 30000,
  mutate: [
    "src/**/*.ts",
    "src/app/.well-known/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.spec.ts",
    "!src/**/__fixtures__/**/*.ts",
  ],
  // 権限エラーになることがあるため
  ignorePatterns: ["docker"],
  plugins: ["@stryker-mutator/jest-runner"],
};
export default config;
