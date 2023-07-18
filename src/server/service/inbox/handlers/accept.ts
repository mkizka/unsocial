import { followRepository } from "@/server/repository";
import { acceptSchema } from "@/server/schema";

import { userService } from "../..";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "../errors";
import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity, followee) => {
  const parsedAccept = acceptSchema.safeParse(activity);
  if (!parsedAccept.success) {
    return new ActivitySchemaValidationError(activity, parsedAccept.error);
  }
  const follower = await userService.findUserByActorId(
    new URL(parsedAccept.data.object.actor),
  );
  if (!follower) {
    return new BadActivityRequestError(
      activity,
      "Acceptされたフォロワーが存在しませんでした",
    );
  }
  await followRepository.accept({
    followeeId: followee.id,
    followerId: follower.id,
  });
};
