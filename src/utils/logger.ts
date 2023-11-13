// Stryker disable all
import winston from "winston";

import { env } from "./env";

const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  silent: env.NODE_ENV === "test",
  transports: new winston.transports.Console(),
});

export const createLogger = (name: string) => logger.child({ name });
