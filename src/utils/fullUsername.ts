import type { User } from "@prisma/client";

import { env } from "@/app/_shared/libs/util/env";

export const fullUsername = (
  user: Pick<User, "preferredUsername" | "host">,
) => {
  if (user.host === env.HOST) {
    return `@${user.preferredUsername}`;
  }
  return `@${user.preferredUsername}@${user.host}`;
};
