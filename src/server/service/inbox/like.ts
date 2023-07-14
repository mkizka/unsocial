import { likeRepository } from "@/server/repository";
import { likeSchema } from "@/server/schema";
import { createLogger } from "@/utils/logger";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
  type InboxHandler,
  resolveNoteId,
} from "./shared";

export const name = "likeService";

const logger = createLogger(name);

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedLike = likeSchema.safeParse(activity);
  if (!parsedLike.success) {
    return new ActivitySchemaValidationError(activity, parsedLike.error);
  }
  const noteId = resolveNoteId(new URL(parsedLike.data.object));
  if (!noteId) {
    return new BadActivityRequestError(
      "activityからいいね対象のノートIDを取得できませんでした",
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
