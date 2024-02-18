import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { prisma } from "@/_shared/utils/prisma";

import {
  ActivitySchemaValidationError,
  BadActivityRequestError,
} from "./errors";
import { type InboxHandler, resolveNoteId } from "./shared";

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedLike = apSchemaService.likeSchema.safeParse(activity);
  if (!parsedLike.success) {
    return new ActivitySchemaValidationError(parsedLike.error);
  }
  const noteId = resolveNoteId(new URL(parsedLike.data.object));
  if (!noteId) {
    return new BadActivityRequestError(
      "activityからいいね対象のノートIDを取得できませんでした",
    );
  }
  await prisma.$transaction([
    prisma.like.create({
      data: {
        noteId,
        userId: actorUser.id,
        content: parsedLike.data.content ?? "👍",
      },
    }),
    prisma.note.update({
      where: { id: noteId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    }),
  ]);
};
