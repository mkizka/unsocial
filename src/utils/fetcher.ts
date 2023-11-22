import pkg from "@/../package.json";

import { env } from "./env";
import { signHeaders } from "./httpSignature/sign";
import { createLogger } from "./logger";

const logger = createLogger("fetcher");

export class FetcherError extends Error {
  constructor() {
    super();
    this.name = "FetchError";
  }
}

export class NotOKError extends Error {
  constructor() {
    super();
    this.name = "NotOKError";
  }
}

type Options = Omit<RequestInit, "body"> & {
  body?: string;
  timeout?: number;
  signer?: {
    id: string;
    privateKey: string;
  };
};

const createHeaders = (url: URL, options?: Options) => {
  const signedHeaders = options?.signer
    ? signHeaders({
        signer: options.signer,
        inboxUrl: url,
        body: options.body ?? "",
        method: options.method ?? "GET",
      })
    : {};
  const headers = new Headers({
    "User-Agent": `Unsocial/${pkg.version} (${env.HOST})`,
    ...options?.headers,
    ...signedHeaders,
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
  const controller = new AbortController();
  const { timeout, ...init } = {
    method: "GET",
    timeout: env.NODE_ENV === "test" ? 100 : 5000,
    signal: controller.signal,
    ...options,
    headers: createHeaders(new URL(input), options),
    next: createNext(options),
  };
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);
  const startTime = performance.now();
  if (init.method === "POST") {
    logger.debug(`fetch(${init.method} ${input}): ${init.body}`);
  }
  return fetch(input, init)
    .then(async (response) => {
      const elapsedTime = Math.floor(performance.now() - startTime);
      logger.info(
        `fetch(${init.method} ${input}): ${response.status} ${response.statusText} (${elapsedTime}ms)`,
      );
      if (!response.ok) {
        return new NotOKError();
      }
      return response;
    })
    .then((response) => {
      if (response instanceof Error) {
        logger.warn(`fetchエラー(${init.method} ${input}): ${response.name}`);
      }
      return response;
    })
    .catch((error) => {
      logger.warn(`fetchエラー(${init.method} ${input}): ${error.message}`);
      return new FetcherError();
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};
