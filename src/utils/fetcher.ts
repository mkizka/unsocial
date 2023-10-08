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

export class NotOKError extends FetchError {
  constructor() {
    super();
    this.name = "NotOKError";
  }
}

export class UnexpectedError extends FetchError {
  constructor() {
    super();
    this.name = "UnexpectedError";
  }
}

type Options = RequestInit & {
  timeout?: number;
};

const createHeaders = (options?: Options) => {
  const headers = new Headers({
    "User-Agent": `Unsocial/${pkg.version} (${env.HOST})`,
    ...options?.headers,
  });
  if (options?.method === "POST") {
    headers.set("Content-Type", "application/json");
  }
  return headers;
};

const createNext = (options?: Options) => {
  return {
    revalidate: options?.method === "POST" ? 0 : 3600,
    ...options?.next,
  };
};

export const fetcher = (input: URL | string, options?: Options) => {
  const { timeout, ...init } = {
    method: "GET",
    timeout: env.NODE_ENV === "test" ? 100 : 5000,
    ...options,
    headers: createHeaders(options),
    next: createNext(options),
  };
  const startTime = performance.now();
  let timeoutId: ReturnType<typeof setTimeout>;
  return Promise.race([
    fetch(
      // なぜかmswがエラーになるのでURLインスタンスが来ても文字列になるようにしておく
      input.toString(),
      init,
    ).then(async (response) => {
      const elapsedTime = Math.floor(performance.now() - startTime);
      logger.info(
        `fetch(${init.method} ${input}): ${response.status} ${response.statusText} (${elapsedTime}ms)`,
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
