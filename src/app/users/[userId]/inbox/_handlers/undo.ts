import { z } from "zod";

import { userService } from "@/server/service";
import { env } from "@/utils/env";
import { formatZodError } from "@/utils/formatZodError";
import { prisma } from "@/utils/prisma";

import type { InboxFunction } from "./types";

const undoActivitySchema = z
  .object({
    type: z.literal("Undo"),
    actor: z.string().url(),
    object: z
      .object({
        type: z.literal("Follow"),
        actor: z.string().url(),
        object: z
          .string()
          .url()
          .transform((val, ctx) => {
            if (new URL(val).host != env.HOST) {
              ctx.addIssue({
                code: "custom",
                message: "フォロー先が自ホストではありません",
              });
              return z.NEVER;
            }
            return val;
          }),
      })
      .passthrough(),
  })
  .passthrough();

export const undo: InboxFunction = async (activity, actorUser) => {
  const parsedUndo = undoActivitySchema.safeParse(activity);
  if (!parsedUndo.success) {
    return {
      status: 400,
      message: "検証失敗: " + formatZodError(parsedUndo.error),
    };
  }
  const followee = await userService.findUserByActorId(
    new URL(parsedUndo.data.object.object)
  );
  if (!followee) {
    return {
      status: 400,
      message:
        "アンフォローリクエストで指定されたフォロイーが存在しませんでした",
    };
  }
  await prisma.follow.delete({
    where: {
      followeeId_followerId: {
        followeeId: followee.id,
        followerId: actorUser.id,
      },
    },
  });
  return {
    status: 200,
    message: "完了: アンフォロー",
  };
};
