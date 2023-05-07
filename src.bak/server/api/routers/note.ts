import { z } from "zod";

import { activityStreams } from "../../../utils/activitypub";
import { queue } from "../../background/queue";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const noteRouter = createTRPCRouter({
  find: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany({
      include: {
        user: {
          select: {
            name: true,
            preferredUsername: true,
            host: true,
          },
        },
        likes: true,
      },
    });
  }),
  findSelf: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.note.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: noteId, ctx }) => {
      // TODO: 自分のじゃなかったらエラー吐く
      await prisma.note.delete({ where: { id: noteId } });
      queue.push({
        runner: "relayActivity",
        params: {
          sender: ctx.session.user,
          activity: activityStreams.delete({
            id: noteId,
            userId: ctx.session.user.id,
          }),
        },
      });
    }),
});
