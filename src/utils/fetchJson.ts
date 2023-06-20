// Stryker disable all
import { createLogger } from "./logger";

const logger = createLogger("fetchJson");

export const fetchJson = (...[input, init]: Parameters<typeof fetch>) => {
  // mswはURLインスタンスで渡されたリクエストをモック出来ない？
  return fetch(input.toString(), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        logger.warn(`HTTPエラー(${input}): ${response.status}`);
        return null;
      }
      return response.json();
    })
    .catch((error) => {
      logger.warn(`ネットワークエラー(${input}): ${error}`);
      return null;
    });
};
