// Stryker disable all
import util from "util";
import winston from "winston";

import { env } from "./env";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize({
      colors: { info: "cyan" },
    }),
    winston.format.uncolorize({
      level: env.NODE_ENV != "development",
    }),
    winston.format.printf((log) =>
      util.format(
        `- %s%s %s`,
        log.level,
        log.name ? `(${log.name})` : "",
        log.message
      )
    )
  ),
  silent: env.NODE_ENV == "test",
  transports: new winston.transports.Console(),
});

export const createLogger = (name: string) => logger.child({ name });
