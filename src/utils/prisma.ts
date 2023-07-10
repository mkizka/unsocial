// Stryker disable all
import { PrismaClient } from "@prisma/client";

import { env } from "./env";
import { createLogger } from "./logger";

const logger = createLogger("prisma");

// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices#solution
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logLevels =
  env.NODE_ENV == "development"
    ? (["info", "warn", "error"] as const)
    : (["error"] as const);

const createPrisma = () => {
  const instance = new PrismaClient({
    log: logLevels.map((level) => ({ emit: "event", level })),
  });
  for (const level of logLevels) {
    instance.$on(level, (e) => {
      logger[level](e.message);
    });
  }
  if (env.NODE_ENV == "development") {
    // https://www.prisma.io/docs/concepts/components/prisma-client/middleware/logging-middleware
    instance.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      logger.info(
        `Query ${params.model}.${params.action} took ${after - before}ms`,
      );
      return result;
    });
  }
  return instance;
};

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
