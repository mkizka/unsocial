import { createLogger } from "./logger";

const logger = createLogger("fetchJson");

export const fetchJson = (
  input: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1] & { timeout?: number },
) => {
  logger.info(`fetch(${input}): 開始`);
  const { timeout, ...options } = init ?? {};
  if (options.method == "POST") {
    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };
  }
  let timeoutId: ReturnType<typeof setTimeout>;
  return Promise.race([
    // なぜかmswがエラーになるのでURLインスタンスが来ても文字列になるようにしておく
    fetch(input.toString(), options).then(async (response) => {
      logger.info(`fetch(${input}): ${await response.clone().text()}`);
      if (!response.ok) {
        throw new Error("Not HTTP 2XX");
      }
      return response.json().catch(() => null);
    }),
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Timeout"));
      }, timeout ?? 5000);
    }),
  ])
    .catch((error) => {
      logger.warn(`fetchエラー(${input}): ${error.message}`);
      return null;
    })
    .finally(() => {
      clearTimeout(timeoutId);
    });
};
