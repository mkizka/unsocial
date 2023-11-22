// Stryker disable all
import winston from "winston";

import { env } from "./env";

const level = (() => {
  if (env.LOG_LEVEL) {
    return env.LOG_LEVEL;
  }
  if (env.NODE_ENV === "development") {
    return "debug";
  }
  return "info";
})();

const logger = winston.createLogger({
  level,
  silent: env.NODE_ENV === "test",
  transports: new winston.transports.Console(),
});

export const createLogger = (name: string) => logger.child({ name });
