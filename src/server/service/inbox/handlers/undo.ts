import type { User } from "@prisma/client";

import { followRepository, likeRepository } from "@/server/repository";
import { undoSchema } from "@/server/schema";
import type { Undo } from "@/server/schema/undo";

import { userService } from "../..";
import type { InboxError } from "../errors";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "../errors";
import type { InboxHandler } from "./shared";
import { resolveNoteId } from "./shared";

type UndoInboxHandler = (
  activity: Undo,
  actorUser: User,
) => Promise<InboxError | void>;

const undoFollow: UndoInboxHandler = async (activity, actorUser) => {
  const followee = await userService.findUserByActorId(
    new URL(activity.object.object),
  );
  if (!followee) {
    return new BadActivityRequestError(
      activity,
      "アンフォローリクエストで指定されたフォロイーが存在しませんでした",
    );
  }
  await followRepository.remove({
    followeeId: followee.id,
    followerId: actorUser.id,
  });
};

const undoLike: UndoInboxHandler = async (activity, actorUser) => {
  const noteId = resolveNoteId(new URL(activity.object.object));
  if (!noteId) {
    return new BadActivityRequestError(
      activity,
      "activityからいいね削除対象のノートIDを取得できませんでした",
    );
  }
  await likeRepository.remove({
    noteId,
    userId: actorUser.id,
  });
};

const undoHandlers = {
  Follow: undoFollow,
  Like: undoLike,
} as const;

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedUndo = undoSchema.safeParse(activity);
  if (!parsedUndo.success) {
    return new ActivitySchemaValidationError(activity, parsedUndo.error);
  }
  await undoHandlers[parsedUndo.data.object.type](parsedUndo.data, actorUser);
};
