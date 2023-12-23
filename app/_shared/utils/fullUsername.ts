import type { User } from "@prisma/client";

import { env } from "./env";

export const fullUsername = (
  user: Pick<User, "preferredUsername" | "host">,
) => {
  if (user.host === env.UNSOCIAL_DOMAIN) {
    return `@${user.preferredUsername}`;
  }
  return `@${user.preferredUsername}@${user.host}`;
};
