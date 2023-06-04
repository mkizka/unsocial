import { prisma } from "@soshal/database";
import { env } from "@soshal/utils";
import { formatZodError } from "@soshal/utils";
import { z } from "zod";

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
    return {
      status: 400,
      message: "検証失敗: " + formatZodError(parsedLike.error),
    };
  }
  const noteId = resolveNoteId(new URL(parsedLike.data.object));
  if (!noteId) {
    return {
      status: 400,
      message: "activityからいいね対象のノートIDを取得できませんでした",
    };
  }
  await prisma.like.create({
    data: {
      noteId,
      userId: actorUser.id,
      content: parsedLike.data.content,
    },
  });
  return { status: 200, message: "完了: いいね" };
};
