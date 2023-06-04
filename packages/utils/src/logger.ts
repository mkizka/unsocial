import { createLogger, format, transports } from "winston";

import { env } from "./env";

export const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.splat(),
    format.printf(
      (log) => `${log.timestamp} - [${log.level.toUpperCase()}] ${log.message}`
    )
  ),
  transports: [
    new transports.Console({
      silent: env.NODE_ENV == "test",
    }),
  ],
});
