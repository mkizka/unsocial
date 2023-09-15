import { followRepository } from "@/server/repository";
import { inboxAcceptSchema } from "@/server/schema/accept";

import { userService } from "../..";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "../errors";
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
  await followRepository.accept({
    followeeId: followee.id,
    followerId: follower.id,
  });
};
