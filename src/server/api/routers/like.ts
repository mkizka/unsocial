import { z } from "zod";
import { activityStreams } from "../../../utils/activitypub";
import { env } from "../../../utils/env";
import { queue } from "../../background/queue";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const likeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: noteId, ctx }) => {
      const like = await prisma.like.create({
        data: {
          userId: ctx.session.user.id,
          noteId,
        },
        include: {
          note: {
            select: {
              user: {
                select: {
                  host: true,
                },
              },
              url: true,
            },
          },
        },
      });
      if (like.note.user.host != env.HOST) {
        if (!like.note.url) {
          throw new Error("ノートのURLがありません");
        }
        queue.push({
          runner: "relayActivity",
          params: {
            activity: activityStreams.like(like, like.note.url),
            privateKey: ctx.session.user.privateKey,
            publicKeyId: `https://${env.HOST}/users/${ctx.session.user.id}#main-key`,
          },
        });
      }
    }),
});
