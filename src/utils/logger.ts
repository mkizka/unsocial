// Stryker disable all
import util from "util";
import {
  createLogger as createOriginalLogger,
  format,
  transports,
} from "winston";

import { env } from "./env";

export const logger = createOriginalLogger({
  format: format.combine(
    format.colorize({
      // next.jsのロガーっぽくするため
      colors: { info: "blue" },
    }),
    format.timestamp(),
    format.printf((log) =>
      util.format(
        `- %s%s %s`,
        log.level,
        log.name ? `(${log.name})` : "",
        log.message
      )
    )
  ),
  transports: [
    new transports.Console({
      silent: env.NODE_ENV == "test",
    }),
  ],
});

export const createLogger = (name: string) => logger.child({ name });
