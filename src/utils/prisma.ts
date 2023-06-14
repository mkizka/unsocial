// Stryker disable all
import { PrismaClient } from "@prisma/client";

import { env } from "./env";

// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices#solution
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
