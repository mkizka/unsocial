import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { userFindService } from "@/_shared/user/services/userFindService";
import { prisma } from "@/_shared/utils/prisma";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity, followee) => {
  const parsedAccept = apSchemaService.acceptSchema.safeParse(activity);
  if (!parsedAccept.success) {
    return new ActivitySchemaValidationError(parsedAccept.error, activity);
  }
  const follower = await userFindService.findOrFetchUserByActor(
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
