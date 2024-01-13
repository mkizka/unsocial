import type { Note } from "@prisma/client";

import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { noteFindService } from "@/_shared/note/services/noteFindService";
import { userFindService } from "@/_shared/user/services/userFindService";
import { prisma } from "@/_shared/utils/prisma";

export const create = async (
  activity: apSchemaService.NoteActivity,
): Promise<Note | Error> => {
  const replyTo = activity.inReplyTo
    ? await noteFindService.findOrFetchNoteByUrl(activity.inReplyTo)
    : null;
  if (replyTo instanceof Error) {
    return replyTo;
  }
  const noteUser = await userFindService.findOrFetchUserByActor(
    activity.attributedTo,
  );
  if (noteUser instanceof Error) {
    return noteUser;
  }
  const note = await prisma.note.create({
    data: {
      userId: noteUser.id,
      url: activity.id,
      content: activity.content,
      publishedAt: activity.published,
      replyToId: replyTo?.id,
      attachments: {
        create: activity.attachment?.map((attachment) => ({
          url: attachment.url,
          mediaType: attachment.mediaType,
        })),
      },
    },
  });
  return note;
};
