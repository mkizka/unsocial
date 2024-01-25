import * as Sentry from "@sentry/nextjs";

import { env } from "./env";
import { createLogger } from "./logger";

jest.mock("@/_shared/utils/env", () => ({
  env: {
    ...process.env,
    NODE_ENV: "development",
    UNSOCIAL_LOG_LEVEL: "debug",
  },
}));

jest.mock("@sentry/nextjs", () => ({
  captureMessage: jest.fn(),
}));
const mockedCaptureMessage = jest.mocked(Sentry.captureMessage);

const spyConsole = {
  debug: jest.spyOn(console, "debug").mockImplementation(() => {}),
  info: jest.spyOn(console, "info").mockImplementation(() => {}),
  warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
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
  test("env.UNSOCIAL_LOG_LEVELが設定されている場合、その値を下回るログは出力されない", () => {
    // arrange
    env.UNSOCIAL_LOG_LEVEL = "warn";
    // act
    logger.debug("debug");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
    // assert
    expect(spyConsole.debug).not.toHaveBeenCalled();
    expect(spyConsole.info).not.toHaveBeenCalled();
    expect(spyConsole.warn).toHaveBeenCalledWith(
      JSON.stringify({
        level: "warn",
        message: "warn",
        name: "test",
      }),
    );
    expect(spyConsole.error).toHaveBeenCalledWith(
      JSON.stringify({
        level: "error",
        message: "error",
        name: "test",
      }),
    );
  });
  test("env.NODE_ENVがwarn以上の場合、Sentryにログが送信される", () => {
    // act
    logger.debug("debug");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
    // assert
    expect(mockedCaptureMessage).toHaveBeenCalledWith("warn", "warning");
    expect(mockedCaptureMessage).toHaveBeenCalledWith("error", "error");
  });
  test("env.NODE_ENVがtestの場合、ログは出力されない", () => {
    // arrange
    env.NODE_ENV = "test";
    // act
    logger.debug("debug");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
    // assert
    expect(spyConsole.debug).not.toHaveBeenCalled();
    expect(spyConsole.info).not.toHaveBeenCalled();
    expect(spyConsole.warn).not.toHaveBeenCalled();
    expect(spyConsole.error).not.toHaveBeenCalled();
  });
});
