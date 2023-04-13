import { json } from "next-runtime";
import { z } from "zod";

import { prisma } from "../../../../server/db";
import { env } from "../../../../utils/env";
import { findUserByActorId } from "../../../../utils/findUserByActorId";
import { formatZodError } from "../../../../utils/formatZodError";
import { logger } from "../../../../utils/logger";
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
    logger.info("検証失敗: " + formatZodError(parsedUndo.error));
    return json({}, 400);
  }
  const followee = await findUserByActorId(
    new URL(parsedUndo.data.object.object)
  );
  if (!followee) {
    logger.info(
      "アンフォローリクエストで指定されたフォロイーが存在しませんでした"
    );
    return json({}, 400);
  }
  await prisma.follow.delete({
    where: {
      followeeId_followerId: {
        followeeId: followee.id,
        followerId: actorUser.id,
      },
    },
  });
  logger.info("完了: アンフォロー");
  return json({}, 200);
};
