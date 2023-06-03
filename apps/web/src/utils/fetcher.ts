import { logger } from "./logger";

type FetchArgs = Parameters<typeof fetch>;

const defaultOptions: FetchArgs[1] = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const fetcher = async (url: FetchArgs[0], init?: FetchArgs[1]) => {
  try {
    const response = await fetch(url, { ...defaultOptions, ...init });
    if (!response.ok) {
      logger.info(`${response.status}: ${response.url}`);
    }
    return (await response.json()) as object;
  } catch (e) {
    logger.info(`fetcher-error: ${e}`);
  }
  return null;
};
