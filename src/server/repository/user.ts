import { cache } from "react";

import { prisma } from "@/utils/prisma";

export type FindUniqueParams =
  | {
      preferredUsername: string;
      host: string;
    }
  | { id: string }
  | { actorUrl: string };

export const findUnique = cache((params: FindUniqueParams) => {
  const where =
    "preferredUsername" in params ? { preferredUsername_host: params } : params;
  return prisma.user.findUnique({ where, include: { credential: true } });
});
