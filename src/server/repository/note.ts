import { cache } from "react";

import { prisma } from "@/utils/prisma";

import type { noteSchema } from "../schema";

const includeForNoteCard = {
  user: true,
  likes: {
    include: {
      user: true,
    },
  },
};

export const findUniqueNoteCard = cache((id: string) => {
  return prisma.note.findUnique({
    where: { id },
    include: includeForNoteCard,
  });
});

export type NoteCard = NonNullable<
  Awaited<ReturnType<typeof findUniqueNoteCard>>
>;

export const findManyNoteCards = cache(() => {
  return prisma.note.findMany({
    include: includeForNoteCard,
    orderBy: {
      createdAt: "desc",
    },
  });
});

export const findManyNoteCardsByUserId = cache((userId: string) => {
  return prisma.note.findMany({
    where: { userId },
    include: includeForNoteCard,
    orderBy: {
      createdAt: "desc",
    },
  });
});

type CreateParams = {
  activity: noteSchema.Note;
  userId: string;
};

export const createFromActivity = cache(
  ({ activity, userId }: CreateParams) => {
    return prisma.note.create({
      data: {
        userId,
        url: activity.id,
        content: activity.content,
        published: activity.published,
      },
    });
  },
);
