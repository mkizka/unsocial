import { cache } from "react";

import { prisma } from "@/utils/prisma";

const includeForNoteCard = {
  user: true,
  likes: {
    include: {
      user: true,
    },
  },
};

export const findManyNoteCards = cache(() => {
  return prisma.note.findMany({
    include: includeForNoteCard,
    orderBy: {
      createdAt: "desc",
    },
  });
});

export const findUniqueNoteCard = cache((id: string) => {
  return prisma.note.findUnique({
    where: { id },
    include: includeForNoteCard,
  });
});

export type NoteCard = NonNullable<
  Awaited<ReturnType<typeof findUniqueNoteCard>>
>;
