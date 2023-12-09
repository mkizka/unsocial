import type { Prisma } from "@prisma/client";
import { cache } from "react";

import { prisma } from "@/app/_shared/utils/prisma";

const includeForNoteCard = {
  user: true,
  attachments: true,
  replyTo: {
    include: {
      user: true,
      attachments: true,
      likes: {
        include: {
          user: true,
        },
      },
    },
  },
  replies: {
    include: {
      user: true,
      attachments: true,
      replies: true,
      likes: {
        include: {
          user: true,
        },
      },
    },
  },
  likes: {
    include: {
      user: true,
    },
  },
} satisfies Prisma.NoteInclude;

export const findUniqueNoteCard = cache((id: string) => {
  return prisma.note.findUnique({
    where: { id },
    include: includeForNoteCard,
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
    include: includeForNoteCard,
    take: params.count,
    orderBy: {
      publishedAt: "desc",
    },
  });
});
