import { cache } from "react";

import { noteRepository } from "@/server/repository";
import type { NoteActivity } from "@/server/schema/note";
import { inboxNoteSchema } from "@/server/schema/note";
import { activitypubService } from "@/server/service/activitypub";
import { userService } from "@/server/service/user";

export const create = async (activity: NoteActivity) => {
  const replyTo = activity.inReplyTo
    ? await findOrCreateByUrl(activity.inReplyTo)
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
  const note = await noteRepository.createFromActivity({
    activity,
    userId: noteUser.id,
    replyToId: replyTo?.id,
  });
  return note;
};

const findOrCreateByUrl = cache(async (url: string) => {
  const note = await noteRepository.findByUrl(url);
  if (note) {
    return note;
  }
  const fetchedNote = await activitypubService.fetchNote(url);
  if (fetchedNote instanceof Error) {
    return fetchedNote;
  }
  // TODO: inboxNoteSchema -> activitypubNoteSchemaにリネーム
  const parsedNote = inboxNoteSchema.safeParse(fetchedNote);
  if (!parsedNote.success) {
    // TODO: 修正
    return new Error("ノートの形式が不正です");
  }
  const noteUser = await userService.findOrFetchUserByActor(
    parsedNote.data.attributedTo,
  );
  if (noteUser instanceof Error) {
    return noteUser;
  }
  const newNote = await noteRepository.createFromActivity({
    activity: parsedNote.data,
    userId: noteUser.id,
  });
  return newNote;
});
