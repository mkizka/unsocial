import { logger } from "./logger";

const defaultOptions: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const fetcher = async (url: RequestInfo, init?: RequestInit) => {
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
