/**
 * https://nextjs.org/docs/testing#setting-up-jest-with-the-rust-compiler
 */
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

const customJestConfig: Config = {
  roots: ["<rootDir>/app"],
  testEnvironment: "@quramy/jest-prisma-node/environment",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  globalSetup: "<rootDir>/jest.global-setup.ts",
  clearMocks: true,
  modulePathIgnorePatterns: ["<rootDir>/.next"],
  moduleNameMapper: {
    // tsconfig.json の paths と同じように書くため
    "^@/(.*)$": "<rootDir>/app/$1",
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
