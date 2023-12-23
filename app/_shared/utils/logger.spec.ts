import { createLogger } from "./logger";

jest.mock("@/_shared/utils/env", () => ({
  env: {
    ...process.env,
    NODE_ENV: "development",
  },
}));

const spyConsole = {
  debug: jest.spyOn(console, "debug"),
  info: jest.spyOn(console, "info"),
  warn: jest.spyOn(console, "warn"),
  error: jest.spyOn(console, "error"),
};

const logger = createLogger("test");

describe("logger", () => {
  test.each`
    level
    ${"debug"}
    ${"info"}
    ${"warn"}
    ${"error"}
  `(
    "logger.$level()でconsole.$level()が呼ばれる",
    ({ level }: { level: keyof typeof logger }) => {
      // act
      logger[level]("message", { foo: "bar" });
      // assert
      expect(spyConsole[level]).toHaveBeenCalledWith(
        JSON.stringify({
          level,
          message: "message",
          name: "test",
          foo: "bar",
        }),
      );
    },
  );
});
