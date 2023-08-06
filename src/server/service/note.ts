import { cache } from "react";

import { env } from "@/utils/env";
import { getUser } from "@/utils/getServerSession";

import { noteRepository } from "../repository";

const format = (note: noteRepository.NoteCard, userId?: string) => {
  return {
    ...note,
    isMine: userId === note.userId,
    isLiked: note.likes.some((like) => like.userId === userId),
    url: `/notes/${note.id}`,
    user: {
      ...note.user,
      displayUsername: `@${note.user.preferredUsername}@${note.user.host}`,
      url:
        `/@${note.user.preferredUsername}` +
        (note.user.host != env.HOST ? `@${note.user.host}` : ""),
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
    if (notes.length == 0) {
      return [];
    }
    const user = await getUser();
    return notes.map((note) => format(note, user?.id));
  },
);

export const findManyNoteCardsByUserId = cache(async (userId: string) => {
  const notes = await noteRepository.findManyNoteCardsByUserId(userId);
  if (notes.length == 0) {
    return [];
  }
  const user = await getUser();
  return notes.map((note) => format(note, user?.id));
});
