import type { User } from "@prisma/client";

import { followRepository, likeRepository } from "@/server/repository";
import { inboxUndoSchema, type UndoActivity } from "@/server/schema/undo";

import { userService } from "../..";
import type { InboxError } from "../errors";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "../errors";
import type { InboxHandler } from "./shared";
import { resolveNoteId } from "./shared";

type UndoInboxHandler = (
  activity: UndoActivity,
  actorUser: User,
) => Promise<InboxError | void>;

const undoFollow: UndoInboxHandler = async (activity, actorUser) => {
  const followee = await userService.findUserByActorId(
    new URL(activity.object.object),
  );
  if (!followee) {
    return new BadActivityRequestError(
      "アンフォローリクエストで指定されたフォロイーが存在しませんでした",
      activity,
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
  const parsedUndo = inboxUndoSchema.safeParse(activity);
  if (!parsedUndo.success) {
    return new ActivitySchemaValidationError(parsedUndo.error, activity);
  }
  await undoHandlers[parsedUndo.data.object.type](parsedUndo.data, actorUser);
};
