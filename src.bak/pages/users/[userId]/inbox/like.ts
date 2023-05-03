import { json } from "next-runtime";
import { z } from "zod";

import { prisma } from "../../../../server/db";
import { env } from "../../../../utils/env";
import { formatZodError } from "../../../../utils/formatZodError";
import { logger } from "../../../../utils/logger";
import type { InboxFunction } from "./types";

const resolveNoteId = (objectId: URL) => {
  if (!objectId.pathname.startsWith("/notes/")) {
    return null;
  }
  return objectId.pathname.split("/")[2];
};

const likeActivitySchema = z
  .object({
    type: z.literal("Like"),
    actor: z.string().url(),
    object: z
      .string()
      .url()
      .transform((val, ctx) => {
        if (new URL(val).host != env.HOST) {
          ctx.addIssue({
            code: "custom",
            message: "自ホストのノートではありません",
          });
          return z.NEVER;
        }
        return val;
      }),
    content: z.string(),
  })
  .passthrough();

export const like: InboxFunction = async (activity, actorUser) => {
  const parsedLike = likeActivitySchema.safeParse(activity);
  if (!parsedLike.success) {
    logger.info("検証失敗: " + formatZodError(parsedLike.error));
    return json({}, 400);
  }
  const noteId = resolveNoteId(new URL(parsedLike.data.object));
  if (!noteId) {
    logger.info("検証失敗: ノートのURLではありません");
    return json({}, 400);
  }
  await prisma.like.create({
    data: {
      noteId,
      userId: actorUser.id,
      content: parsedLike.data.content,
    },
  });
  logger.info("完了: いいね");
  return json({}, 200);
};
