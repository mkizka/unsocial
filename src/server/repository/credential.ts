import { cache } from "react";

import { prisma } from "@/utils/prisma";

export const findUnique = cache((userId: string) => {
  return prisma.credential.findUnique({
    where: {
      userId,
    },
  });
});
