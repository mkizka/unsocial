import { z } from "zod";

import { prisma } from "../../db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const likeRouter = createTRPCRouter({
  details: publicProcedure.input(z.string()).query(({ input }) => {
    return prisma.like.findMany({
      select: {
        content: true,
        user: {
          select: {
            id: true,
            name: true,
            preferredUsername: true,
            host: true,
          },
        },
      },
      where: { noteId: input },
    });
  }),
});
