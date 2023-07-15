import type { User } from "@prisma/client";

import { followRepository, likeRepository } from "@/server/repository";
import { undoSchema } from "@/server/schema";

import { userService } from "..";
import type { InboxHandler } from "./shared";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
  resolveNoteId,
} from "./shared";

const undoFollow = async (actorUser: User, undoActorId: URL) => {
  const followee = await userService.findUserByActorId(undoActorId);
  if (!followee) {
    return new BadActivityRequestError(
      "アンフォローリクエストで指定されたフォロイーが存在しませんでした",
    );
  }
  await followRepository.remove({
    followeeId: followee.id,
    followerId: actorUser.id,
  });
};

const undoLike = async (actorUser: User, undoObjectId: URL) => {
  const noteId = resolveNoteId(undoObjectId);
  if (!noteId) {
    return new BadActivityRequestError(
      "activityからいいね削除対象のノートIDを取得できませんでした",
    );
  }
  await likeRepository.remove({
    noteId,
    userId: actorUser.id,
  });
};

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedUndo = undoSchema.safeParse(activity);
  if (!parsedUndo.success) {
    return new ActivitySchemaValidationError(activity, parsedUndo.error);
  }
  const undoObject = parsedUndo.data.object;
  if (undoObject.type === "Follow") {
    return undoFollow(actorUser, new URL(undoObject.object));
  }
  return undoLike(actorUser, new URL(undoObject.object));
};
