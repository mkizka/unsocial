import type { User } from "@prisma/client";

import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";

export const logger = createLogger("userFindService");

export const shouldRefetch = (user: User) => {
  if (user.host === env.UNSOCIAL_HOST) {
    return false;
  }
  if (!user.lastFetchedAt) {
    return true;
  }
  const diff = Date.now() - user.lastFetchedAt.getTime();
  return diff >= 1000 * 60 * 60 * 3;
};
