import { logger } from "./logger";

export const fetcher = async (...args: Parameters<typeof fetch>) => {
  try {
    const response = await fetch(...args);
    if (!response.ok) {
      logger.info(`${response.status}: ${response.url}`);
    }
    return response.json() as Promise<object>;
  } catch (e) {}
  return null;
};
