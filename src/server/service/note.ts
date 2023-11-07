import type { Document } from "@prisma/client";
import { cache } from "react";

import { noteRepository } from "@/server/repository";
import type { NoteActivity } from "@/server/schema/note";
import { inboxNoteSchema } from "@/server/schema/note";
import { fullUsername } from "@/utils/fullUsername";
import { getUser } from "@/utils/getServerSession";

import { activitypubService } from "./activitypub";
import { userService } from "./user";

const getAttachmentUrl = (attachments: Document[]) => {
  if (attachments.length === 0) {
    return null;
  }
  const [_, ext] = attachments[0]!.mediaType.split("/");
  // png以外をサポートするなら修正
  if (ext === "png") {
    return `/documents/${attachments[0]!.id}/image.webp`;
  }
  return null;
};

const format = (note: noteRepository.NoteCard, userId?: string) => {
  return {
    ...note,
    attachmentUrl: getAttachmentUrl(note.attachments),
    isMine: userId === note.userId,
    isLiked: note.likes.some((like) => like.userId === userId),
    url: `/notes/${note.id}`,
    user: {
      ...note.user,
      displayUsername: fullUsername(note.user),
      url: `/${fullUsername(note.user)}`,
    },
  };
};

export type NoteCard = NonNullable<Awaited<ReturnType<typeof format>>>;

export const findUniqueNoteCard = cache(async (id: string) => {
  const note = await noteRepository.findUniqueNoteCard(id);
  if (!note) {
    return null;
  }
  const user = await getUser();
  return format(note, user?.id);
});

export const findManyNoteCards = cache(
  async (params: noteRepository.FindManyParams) => {
    const notes = await noteRepository.findManyNoteCards(params);
    if (notes.length === 0) {
      return [];
    }
    const user = await getUser();
    return notes.map((note) => format(note, user?.id));
  },
);

export const findManyNoteCardsByUserId = cache(async (userId: string) => {
  const notes = await noteRepository.findManyNoteCardsByUserId(userId);
  if (notes.length === 0) {
    return [];
  }
  const user = await getUser();
  return notes.map((note) => format(note, user?.id));
});

export const create = async (params: noteRepository.CreateParams) => {
  const note = await noteRepository.create(params);
  const user = await getUser();
  return format(note, user?.id);
};

export const createFromActivity = async (activity: NoteActivity) => {
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
