import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { noteFindService } from "@/_shared/note/services/noteFindService";
import { prisma } from "@/_shared/utils/prisma";

import { ActivitySchemaValidationError } from "./errors";
import type { InboxHandler } from "./shared";

export const handle: InboxHandler = async (activity, actor) => {
  const parsedAnnounce = apSchemaService.announceSchema.safeParse(activity);
  if (!parsedAnnounce.success) {
    return new ActivitySchemaValidationError(parsedAnnounce.error);
  }
  const announcedNote = await noteFindService.findOrFetchNoteByUrl(
    parsedAnnounce.data.object,
  );
  if (announcedNote instanceof Error) {
    throw announcedNote;
  }
  // リレーからのAnnounceにはpublishedが含まれないので、
  // publishedが存在する場合のみノートを作成する
  if (parsedAnnounce.data.published) {
    await prisma.note.create({
      data: {
        userId: actor.id,
        content: "",
        url: parsedAnnounce.data.id,
        quoteId: announcedNote.id,
        publishedAt: parsedAnnounce.data.published,
      },
    });
  }
};
