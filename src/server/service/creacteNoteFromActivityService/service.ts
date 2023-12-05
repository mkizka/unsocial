import { cache } from "react";

import { env } from "@/app/_shared/libs/util/env";
import { noteRepository } from "@/server/repository";
import type { NoteActivity } from "@/server/schema/note";
import { inboxNoteSchema } from "@/server/schema/note";
import { activitypubService } from "@/server/service/activitypub";
import { userService } from "@/server/service/user";

const getLocalNoteId = (noteUrl: string) => {
  const url = new URL(noteUrl);
  // https://myhost.example.com/notes/[noteId]/activity
  const [_, prefixPath, noteId, lastPath] = url.pathname.split("/");
  if (
    url.host === env.HOST &&
    prefixPath === "notes" &&
    lastPath === "activity"
  ) {
    return noteId;
  }
  return null;
};

const findByNoteUrl = (noteUrl: string) => {
  const localNoteId = getLocalNoteId(noteUrl);
  if (localNoteId) {
    return noteRepository.findUnique({
      id: localNoteId,
    });
  }
  return noteRepository.findUnique({
    url: noteUrl,
  });
};

const findOrCreateByUrl = cache(async (url: string) => {
  const localNote = await findByNoteUrl(url);
  if (localNote) {
    return localNote;
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
