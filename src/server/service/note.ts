import type { Document } from "@prisma/client";
import { cache } from "react";

import { noteRepository } from "@/server/repository";
import { fullUsername } from "@/utils/fullUsername";
import { getUser } from "@/utils/getServerSession";

const getAttachmentUrl = (attachments: Document[]) => {
  if (attachments.length === 0) {
    return null;
  }
  const [_, ext] = attachments[0]!.mediaType.split("/");
  // png以外をサポートするなら修正
  if (ext === "png") {
    return `/document/${attachments[0]!.id}/image.png`;
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
