import { cache } from "react";
import { fromZodError } from "zod-validation-error";

import { apFetchService } from "@/_shared/activitypub/apFetchService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
import { noteCreateService } from "@/_shared/note/services/noteCreateService";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

const logger = createLogger("noteFindService");

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

export class ActivityValidationError extends Error {
  name = "ActivityValidationError";
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
    logger.info(`ノートの取得に失敗しました: ${fetchedNote.name}`);
    return fetchedNote;
  }
  const parsedNote = apSchemaService.noteSchema.safeParse(fetchedNote);
  if (!parsedNote.success) {
    logger.info(
      `ノートの検証に失敗しました: ${fromZodError(parsedNote.error)}`,
    );
    return new ActivityValidationError();
  }
  return noteCreateService.create(parsedNote.data);
});
