// Stryker disable all
import { createLogger } from "./logger";

const logger = createLogger("fetchJson");

const jsonOrText = async (response: Response) => {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

export const fetchJson = async (...[input, init]: Parameters<typeof fetch>) => {
  try {
    // mswはURLインスタンスで渡されたリクエストをモック出来ない？
    const response = await fetch(input.toString(), {
      ...init,
      headers: {
        ...init?.headers,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      logger.warn(`HTTPエラー(${input}): ${response.status}`);
      return null;
    }
    return await jsonOrText(response);
  } catch (error) {
    logger.warn(`fetchエラー(${input}): ${error}`);
    return null;
  }
};
