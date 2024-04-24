import * as Sentry from "@sentry/nextjs";

import { env } from "./env";

type LogLevel = typeof env.UNSOCIAL_LOG_LEVEL;

// https://docs.railway.app/guides/logs#structured-logs
type StructuredLog = {
  message: string;
  level: LogLevel;
  [key: string]: string | number | boolean | object | null;
};

type LogFunction = (message: string, data?: object) => void;

type Logger = {
  [level in LogLevel]: LogFunction;
};

const logLevelsOrder = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} satisfies Record<LogLevel, number>;

const sentryLevel = (level: LogLevel) => {
  switch (level) {
    case "warn":
      return "warning";
    default:
      return level;
  }
};

const isLower = (a: LogLevel, b: LogLevel) => {
  return logLevelsOrder[a] < logLevelsOrder[b];
};

const isSameOrHigher = (a: LogLevel, b: LogLevel) => {
  return !isLower(a, b);
};

const railwayLog = (log: StructuredLog) => {
  if (env.NODE_ENV === "test" || isLower(log.level, env.UNSOCIAL_LOG_LEVEL)) {
    return;
  }
  console[log.level](JSON.stringify(log));
  if (isSameOrHigher(log.level, env.UNSOCIAL_SENTRY_LOG_LEVEL)) {
    Sentry.captureMessage(log.message, sentryLevel(log.level));
  }
};

export const createLogger = (name: string): Logger => {
  return {
    debug(message, data) {
      railwayLog({ level: "debug", message, name, ...data });
    },
    info(message, data) {
      railwayLog({ level: "info", message, name, ...data });
    },
    warn(message, data) {
      railwayLog({ level: "warn", message, name, ...data });
    },
    error(message, data) {
      railwayLog({ level: "error", message, name, ...data });
    },
  };
};
