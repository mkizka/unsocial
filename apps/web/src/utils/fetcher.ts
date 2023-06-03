import { logger } from "./logger";

const defaultOptions: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

type FetchArgs = Parameters<typeof fetch>;

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
