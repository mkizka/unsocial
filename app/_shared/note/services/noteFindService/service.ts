import { cache } from "react";

import { apFetchService } from "@/_shared/activitypub/apFetchService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { noteActivityService } from "@/_shared/note/services/noteActivityService";
import { userService } from "@/_shared/service/user";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

const getLocalNoteId = (noteUrl: string) => {
  const url = new URL(noteUrl);
  // https://myhost.example.com/notes/[noteId]/activity
  const [_, prefixPath, noteId, lastPath] = url.pathname.split("/");
  if (
    url.host === env.UNSOCIAL_HOST &&
    prefixPath === "notes" &&
    lastPath === "activity"
  ) {
    return noteId;
  }
  return null;
};

export class NotFoundError extends Error {
  name = "NotFoundError";
}

const findNoteById = async (id: string) => {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) {
    return new NotFoundError();
  }
  return note;
};

export const findOrFetchNoteByUrl = cache(async (url: string) => {
  const localNoteId = getLocalNoteId(url);
  if (localNoteId) {
    return findNoteById(localNoteId);
  }
  const existingNote = await prisma.note.findUnique({ where: { url } });
  if (existingNote) {
    // ノートは一度作成された内容が更新されることを
    // 今のところ想定しないため、 DBにあればそれを返す
    return existingNote;
  }
  const fetchedNote = await apFetchService.fetchActivity(url);
  if (fetchedNote instanceof Error) {
    return fetchedNote;
  }
  const parsedNote = apSchemaService.noteSchema.safeParse(fetchedNote);
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
  const newNote = await noteActivityService.create({
    activity: parsedNote.data,
    userId: noteUser.id,
  });
  return newNote;
});
