import { json } from "next-runtime";
import { z } from "zod";

import { prisma } from "../../../../server/db";
import { findUserByActorId } from "../../../../utils/findUserByActorId";
import { formatZodError } from "../../../../utils/formatZodError";
import { logger } from "../../../../utils/logger";
import type { InboxFunction } from "./types";

const acceptActivitySchema = z.object({
  type: z.literal("Accept"),
  object: z.object({
    type: z.literal("Follow"),
    actor: z.string().url(),
    object: z.string().url(),
  }),
});

export const accept: InboxFunction = async (activity, followee) => {
  const parsedAccept = acceptActivitySchema.safeParse(activity);
  if (!parsedAccept.success) {
    logger.info("検証失敗: " + formatZodError(parsedAccept.error));
    return json({}, 400);
  }
  const follower = await findUserByActorId(
    new URL(parsedAccept.data.object.actor)
  );
  if (!follower) {
    logger.info("Acceptされたフォロワーが存在しませんでした");
    return json({}, 400);
  }
  try {
    await prisma.follow.update({
      where: {
        followeeId_followerId: {
          followeeId: followee.id,
          followerId: follower.id,
        },
      },
      data: {
        status: "ACCEPTED",
      },
    });
    logger.info(`完了: フォロー承認`);
    return json({}, 200);
  } catch (e) {
    logger.error(`フォローのAcceptに失敗しました: ${e}`);
    return json({}, 500);
  }
};
