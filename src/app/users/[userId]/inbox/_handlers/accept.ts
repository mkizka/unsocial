import { z } from "zod";

import { userService } from "@/server/service";
import { formatZodError } from "@/utils/formatZodError";
import { prisma } from "@/utils/prisma";

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
    return {
      status: 400,
      message: "検証失敗: " + formatZodError(parsedAccept.error),
    };
  }
  const follower = await userService.findUserByActorId(
    new URL(parsedAccept.data.object.actor)
  );
  if (!follower) {
    return {
      status: 400,
      message: "Acceptされたフォロワーが存在しませんでした",
    };
  }
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
  return { status: 200, message: "完了: フォロー承認" };
};
