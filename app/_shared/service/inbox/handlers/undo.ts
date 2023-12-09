import type { User } from "@prisma/client";

import { inboxUndoSchema, type UndoActivity } from "@/_shared/schema/undo";
import type { InboxError } from "@/_shared/service/inbox/errors";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "@/_shared/service/inbox/errors";
import { userService } from "@/_shared/service/user";
import { prisma } from "@/_shared/utils/prisma";

import type { InboxHandler } from "./shared";
import { resolveNoteId } from "./shared";

type UndoInboxHandler = (
  activity: UndoActivity,
  actorUser: User,
) => Promise<InboxError | void>;

const undoFollow: UndoInboxHandler = async (activity, actorUser) => {
  const followee = await userService.findOrFetchUserByActor(
    activity.object.object,
  );
  if (followee instanceof Error) {
    return new BadActivityRequestError(
      "アンフォローリクエストで指定されたフォロイーが存在しませんでした",
      activity,
    );
  }
  await prisma.follow.delete({
    where: {
      followeeId_followerId: {
        followeeId: followee.id,
        followerId: actorUser.id,
      },
    },
  });
};

const undoLike: UndoInboxHandler = async (activity, actorUser) => {
  const noteId = resolveNoteId(new URL(activity.object.object));
  if (!noteId) {
    return new BadActivityRequestError(
      "activityからいいね削除対象のノートIDを取得できませんでした",
      activity,
    );
  }
  await prisma.like.deleteMany({
    where: {
      noteId,
      userId: actorUser.id,
    },
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
