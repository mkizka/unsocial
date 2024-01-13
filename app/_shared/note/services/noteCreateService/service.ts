import type { Note } from "@prisma/client";

import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { noteActivityService } from "@/_shared/note/services/noteActivityService";
import { noteFindService } from "@/_shared/note/services/noteFindService";
import { userService } from "@/_shared/service/user";

export const create = async (
  activity: apSchemaService.NoteActivity,
): Promise<Note | Error> => {
  const replyTo = activity.inReplyTo
    ? await noteFindService.findOrFetchNoteByUrl(activity.inReplyTo)
    : null;
  if (replyTo instanceof Error) {
    return replyTo;
  }
  const noteUser = await userService.findOrFetchUserByActor(
    activity.attributedTo,
  );
  if (noteUser instanceof Error) {
    return noteUser;
  }
  const note = await noteActivityService.create({
    activity,
    userId: noteUser.id,
    replyToId: replyTo?.id,
  });
  return note;
};
