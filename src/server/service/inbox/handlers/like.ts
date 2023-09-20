import { likeRepository } from "@/server/repository";
import { inboxLikeSchema } from "@/server/schema/like";
import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "@/server/service/inbox/errors";
import { createLogger } from "@/utils/logger";

import { type InboxHandler, resolveNoteId } from "./shared";

const logger = createLogger("inboxLikeService");

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
  await likeRepository
    .create({
      noteId,
      userId: actorUser.id,
      content: parsedLike.data.content ?? "👍",
    })
    .catch((e) => logger.warn(e));
};
