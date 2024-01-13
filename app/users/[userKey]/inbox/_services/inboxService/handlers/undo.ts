import type { User } from "@prisma/client";

import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { userFindService } from "@/_shared/user/services/userFindService";
import { prisma } from "@/_shared/utils/prisma";

import type { InboxError } from "./errors";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import type { InboxHandler } from "./shared";
import { resolveNoteId } from "./shared";

type UndoInboxHandler = (
  activity: apSchemaService.UndoActivity,
  actorUser: User,
) => Promise<InboxError | void>;

const undoFollow: UndoInboxHandler = async (activity, actorUser) => {
  const followee = await userFindService.findOrFetchUserByActor(
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
  const parsedUndo = apSchemaService.undoSchema.safeParse(activity);
  if (!parsedUndo.success) {
    return new ActivitySchemaValidationError(parsedUndo.error, activity);
  }
  await undoHandlers[parsedUndo.data.object.type](parsedUndo.data, actorUser);
};
