import pkg from "@/../package.json";

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

type Options = RequestInit & {
  timeout?: number;
};

const defaultOptions = {
  method: "GET",
  headers: {
    "User-Agent": `Unsocial/${pkg.version} (${env.HOST})`,
  },
  timeout: env.NODE_ENV === "test" ? 100 : 5000,
} satisfies Options;

const createHeaders = (options?: Options) => {
  const headers = new Headers({
    ...options?.headers,
    ...defaultOptions.headers,
  });
  if (options?.method === "POST") {
    headers.set("Content-Type", "application/json");
  }
  return headers;
};

export const fetchJson = (input: URL | string, options?: Options) => {
  const { timeout, ...init } = {
    ...defaultOptions,
    ...options,
    headers: createHeaders(options),
  };
  let timeoutId: ReturnType<typeof setTimeout>;
  logger.info(`fetch(${init.method} ${input}): 開始`);
  return Promise.race([
    fetch(
      // なぜかmswがエラーになるのでURLインスタンスが来ても文字列になるようにしておく
      input.toString(),
      init,
    ).then(async (response) => {
      logger.info(
        `fetch(${init.method} ${input}): ${await response.clone().text()}`,
      );
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
      }, timeout);
    }),
  ])
    .then((jsonOrError) => {
      if (jsonOrError instanceof FetchError) {
        logger.warn(
          `fetchエラー(${init.method} ${input}): ${jsonOrError.name}`,
        );
      }
      return jsonOrError;
    })
    .catch((error) => {
      logger.warn(`fetchエラー(${init.method} ${input}): ${error}`);
      return new UnexpectedError();
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};
