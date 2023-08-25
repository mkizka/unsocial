import { env } from "./env";
import { createLogger } from "./logger";

const logger = createLogger("fetchJson");

export class FetchError extends Error {}

export class TimeoutError extends FetchError {
  name = "TimeoutError";
}

export class NotOKError extends FetchError {
  name = "NotOKError";
}

export class JSONParseError extends FetchError {
  name = "JSONParseError";
}

export class UnexpectedError extends FetchError {
  name = "UnexpectedError";
}

const defaultTimeout = env.NODE_ENV === "test" ? 100 : 5000;

export const fetchJson = (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1] & { timeout?: number },
) => {
  logger.info(`fetch(${input}): 開始`);
  const { timeout, ...options } = init ?? {};
  if (options.method == "POST") {
    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };
  }
  let timeoutId: ReturnType<typeof setTimeout>;
  return Promise.race([
    fetch(
      // なぜかmswがエラーになるのでURLインスタンスが来ても文字列になるようにしておく
      input.toString(),
      options,
    ).then(async (response) => {
      logger.info(`fetch(${input}): ${await response.clone().text()}`);
      if (!response.ok) {
        return new NotOKError();
      }
      try {
        return await response.json();
      } catch {
        return new JSONParseError();
      }
    }),
    new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(new TimeoutError());
      }, timeout ?? defaultTimeout);
    }),
  ])
    .then((jsonOrError) => {
      if (jsonOrError instanceof FetchError) {
        logger.warn(`fetchエラー(${input}): ${jsonOrError.name}`);
      }
      return jsonOrError;
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};
