import type { User } from "@prisma/client";

import { env } from "./env";

export const getUserId = (user: Pick<User, "preferredUsername" | "host">) => {
  if (user.host === env.UNSOCIAL_HOST) {
    return `@${user.preferredUsername}`;
  }
  return `@${user.preferredUsername}@${user.host}`;
};
