import { cache } from "react";

import { apFetchService } from "@/_shared/activitypub/apFetchService";
import { apSchemaService } from "@/_shared/activitypub/apSchemaService";
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

const findByNoteUrl = (noteUrl: string) => {
  const localNoteId = getLocalNoteId(noteUrl);
  if (localNoteId) {
    return prisma.note.findUnique({
      where: {
        id: localNoteId,
      },
    });
  }
  return prisma.note.findUnique({
    where: {
      url: noteUrl,
    },
  });
};

type CreateFromActivityParams = {
  activity: apSchemaService.NoteActivity;
  userId: string;
  replyToId?: string;
};

const createFromActivity = ({
  activity,
  userId,
  replyToId,
}: CreateFromActivityParams) => {
  return prisma.note.create({
    data: {
      userId,
      url: activity.id,
      content: activity.content,
      publishedAt: activity.published,
      replyToId,
      attachments: {
        create: activity.attachment?.map((attachment) => ({
          url: attachment.url,
          mediaType: attachment.mediaType,
        })),
      },
    },
  });
};

export const findOrCreateByUrl = cache(async (url: string) => {
  const localNote = await findByNoteUrl(url);
  if (localNote) {
    return localNote;
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
  const newNote = await createFromActivity({
    activity: parsedNote.data,
    userId: noteUser.id,
  });
  return newNote;
});

export const create = async (activity: apSchemaService.NoteActivity) => {
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
  const note = await createFromActivity({
    activity,
    userId: noteUser.id,
    replyToId: replyTo?.id,
  });
  return note;
};
