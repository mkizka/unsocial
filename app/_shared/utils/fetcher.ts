import pkg from "@/../package.json";
import { httpSignatureSignService } from "@/_shared/activitypub/httpSignatureSignService";

import { env } from "./env";
import { createLogger } from "./logger";

const logger = createLogger("fetcher");

export class FetcherError extends Error {
  name = "FetcherError";
}

export class NotOKError extends Error {
  name = "NotOKError";
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
  const defaultHeaders: Record<string, string> = {
    "user-agent": `Unsocial/${pkg.version} (${env.UNSOCIAL_HOST})`,
  };
  if (options?.method === "POST") {
    defaultHeaders["content-type"] = "application/json";
  }
  if (options?.signer) {
    Object.assign(
      defaultHeaders,
      httpSignatureSignService.signHeaders({
        signer: options.signer,
        inboxUrl: url,
        body: options.body ?? "",
        method: options.method ?? "GET",
      }),
    );
  }
  return new Headers({
    ...defaultHeaders,
    ...options?.headers,
  });
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
    .catch((error) => {
      return new FetcherError(error.message);
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};
