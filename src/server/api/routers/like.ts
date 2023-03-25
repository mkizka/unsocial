import type { Like } from "@prisma/client";
import { z } from "zod";
import { activityStreams } from "../../../utils/activitypub";
import { env } from "../../../utils/env";
import { queue } from "../../background/queue";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

type User = {
  id: string;
  privateKey: string;
};

const include = {
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
};

const inputSchema = z.object({
  noteId: z.string(),
  content: z.enum(["👍"]),
});

type InputType = z.infer<typeof inputSchema>;

const like = async (user: User, input: InputType) => {
  const like = await prisma.like.create({
    data: {
      userId: user.id,
      ...input,
    },
    include,
  });
  if (like.note.user.host != env.HOST) {
    if (!like.note.url) {
      throw new Error("ノートのURLがありません");
    }
    queue.push({
      runner: "relayActivity",
      params: {
        sender: user,
        activity: activityStreams.like(like, like.note.url),
      },
    });
  }
};

type LikeWithNote = Like & {
  note: {
    url: string | null;
    user: {
      host: string;
    };
  };
};

const unlike = async (user: User, like: LikeWithNote) => {
  await prisma.like.delete({
    where: {
      id: like.id,
    },
  });
  if (like.note.user.host != env.HOST) {
    if (!like.note.url) {
      throw new Error("ノートのURLがありません");
    }
    queue.push({
      runner: "relayActivity",
      params: {
        sender: user,
        activity: activityStreams.undo(
          activityStreams.like(like, like.note.url)
        ),
      },
    });
  }
};

export const likeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(inputSchema)
    .mutation(async ({ input, ctx }) => {
      const existingLike = await prisma.like.findFirst({
        where: {
          userId: ctx.session.user.id,
          ...input,
        },
        include,
      });
      if (existingLike) {
        await unlike(ctx.session.user, existingLike);
      } else {
        await like(ctx.session.user, input);
      }
    }),
});
