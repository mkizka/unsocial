import { inboxLikeSchema } from "@/app/_shared/schema/like";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "@/app/_shared/service/inbox/errors";
import { prisma } from "@/app/_shared/utils/prisma";

import { type InboxHandler, resolveNoteId } from "./shared";

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedLike = inboxLikeSchema.safeParse(activity);
  if (!parsedLike.success) {
    return new ActivitySchemaValidationError(parsedLike.error, activity);
  }
  const noteId = resolveNoteId(new URL(parsedLike.data.object));
  if (!noteId) {
    return new BadActivityRequestError(
      "activityからいいね対象のノートIDを取得できませんでした",
      activity,
    );
  }
  await prisma.like.create({
    data: {
      noteId,
      userId: actorUser.id,
      content: parsedLike.data.content ?? "👍",
    },
  });
};
