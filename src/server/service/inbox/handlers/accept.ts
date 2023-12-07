import { inboxAcceptSchema } from "@/server/schema/accept";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "@/server/service/inbox/errors";
import { userService } from "@/server/service/user";
import { prisma } from "@/utils/prisma";

import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity, followee) => {
  const parsedAccept = inboxAcceptSchema.safeParse(activity);
  if (!parsedAccept.success) {
    return new ActivitySchemaValidationError(parsedAccept.error, activity);
  }
  const follower = await userService.findOrFetchUserByActor(
    parsedAccept.data.object.actor,
  );
  if (follower instanceof Error) {
    return new BadActivityRequestError(
      "Acceptされたフォロワーが存在しませんでした",
      activity,
    );
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
};
