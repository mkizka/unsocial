import { logger } from "./logger";

export const fetcher = async (...args: Parameters<typeof fetch>) => {
  try {
    const response = await fetch(...args);
    if (!response.ok) {
      logger.info(`${response.status}: ${response.url}`);
    }
    return (await response.json()) as object;
  } catch (e) {
    logger.info(`fetcher-error: ${e}`);
  }
  return null;
};
