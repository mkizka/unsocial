import { z } from "zod";
import { activityStreams } from "../../../utils/activitypub";
import { env } from "../../../utils/env";
import { queue } from "../../background/queue";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const likeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
        content: z.enum(["👍"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: ctx.session.user.id,
          noteId: input.noteId,
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
      if (existingLike) {
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });
        if (existingLike.note.user.host != env.HOST) {
          if (!existingLike.note.url) {
            throw new Error("ノートのURLがありません");
          }
          queue.push({
            runner: "relayActivity",
            params: {
              activity: activityStreams.undo(
                activityStreams.like(existingLike, existingLike.note.url)
              ),
              privateKey: ctx.session.user.privateKey,
              publicKeyId: `https://${env.HOST}/users/${ctx.session.user.id}#main-key`,
            },
          });
        }
        return;
      }
      const like = await prisma.like.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
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
