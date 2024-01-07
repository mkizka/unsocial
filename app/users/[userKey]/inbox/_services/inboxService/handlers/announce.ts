import { inboxAnnounceSchema } from "@/_shared/schema/announce";
import { createNoteActivityService } from "@/_shared/service/creacteNoteFromActivityService";
import { prisma } from "@/_shared/utils/prisma";

import {
  ActivitySchemaValidationError,
  UnexpectedActivityRequestError,
} from "./errors";
import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity, actor) => {
  const parsedAnnounce = inboxAnnounceSchema.safeParse(activity);
  if (!parsedAnnounce.success) {
    return new ActivitySchemaValidationError(parsedAnnounce.error, activity);
  }
  const announcedNote = await createNoteActivityService.findOrCreateByUrl(
    parsedAnnounce.data.object,
  );
  if (announcedNote instanceof Error) {
    return new UnexpectedActivityRequestError(
      "リポストしたノートの取得に失敗しました",
      announcedNote,
    );
  }
  await prisma.note.create({
    data: {
      userId: actor.id,
      content: "",
      quoteId: announcedNote.id,
      publishedAt: parsedAnnounce.data.published,
    },
  });
};
