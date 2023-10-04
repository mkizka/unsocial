import pkg from "@/../package.json";

import { env } from "./env";
import { createLogger } from "./logger";

const logger = createLogger("fetcher");

export class FetchError extends Error {}

export class TimeoutError extends FetchError {
  constructor() {
    super();
    this.name = "TimeoutError";
  }
}

export class NotOKError extends FetchError {}

export class UnexpectedError extends FetchError {}

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

export const fetcher = (input: URL | string, options?: Options) => {
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
        `fetch(${init.method} ${input}): ${response.status} ${response.statusText}`,
      );
      if (!response.ok) {
        return new NotOKError();
      }
      return response;
    }),
    new Promise<TimeoutError>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(new TimeoutError());
      }, timeout);
    }),
  ])
    .then((response) => {
      if (response instanceof FetchError) {
        logger.warn(`fetchエラー(${init.method} ${input}): ${response.name}`);
      }
      return response;
    })
    .catch((error) => {
      logger.warn(`fetchエラー(${init.method} ${input}): ${error.message}`);
      return new UnexpectedError();
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};
