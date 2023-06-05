// Stryker disable all
import { PrismaClient } from "@prisma/client";

import { env } from "@/utils/env";

export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
