import type { Prisma } from "@prisma/client";
import { cache } from "react";

import { prisma } from "@/_shared/utils/prisma";

const includeNoteCard = {
  user: true,
  attachments: true,
  quotes: {
    select: {
      userId: true,
    },
  },
  likes: {
    include: {
      user: true,
    },
  },
} satisfies Prisma.NoteInclude;

const includeNoteCardWithReplies = {
  ...includeNoteCard,
  quote: {
    include: includeNoteCard,
  },
  replyTo: {
    include: includeNoteCard,
  },
  replies: {
    include: {
      ...includeNoteCard,
      replies: true,
    },
  },
} satisfies Prisma.NoteInclude;

export const findUniqueNoteCard = cache((id: string) => {
  return prisma.note.findUnique({
    where: { id },
    include: includeNoteCardWithReplies,
  });
});

export type NoteCard = NonNullable<
  Awaited<ReturnType<typeof findUniqueNoteCard>>
>;

export type FindManyParams = {
  count: number;
  userId?: string;
  since?: Date;
  until?: Date;
};

export const findManyNoteCards = cache((params: FindManyParams) => {
  return prisma.note.findMany({
    where: {
      userId: params.userId,
      publishedAt: {
        gt: params.since,
        lt: params.until,
      },
    },
    include: includeNoteCardWithReplies,
    take: params.count,
    orderBy: {
      publishedAt: "desc",
    },
  });
});
