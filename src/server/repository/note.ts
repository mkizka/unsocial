import { cache } from "react";

import { prisma } from "@/utils/prisma";

export const findTimeline = cache(() => {
  return prisma.note.findMany({
    include: {
      user: true,
      likes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
});
