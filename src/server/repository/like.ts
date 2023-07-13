import { cache } from "react";

import { prisma } from "@/utils/prisma";

type Options = {
  noteId: string;
  userId: string;
  content: string;
};

export const create = cache((options: Options) => {
  return prisma.like.create({
    data: options,
  });
});
