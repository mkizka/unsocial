import type { Prisma } from "@prisma/client";
import { cache } from "react";

import { prisma } from "@/utils/prisma";

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

type FindUniqueParams =
  | {
      url: string;
    }
  | {
      id: string;
    };

export const findUnique = (params: FindUniqueParams) => {
  return prisma.note.findUnique({
    where: params,
  });
};

export type CreateParams = {
  userId: string;
  content: string;
  publishedAt: Date;
  replyToId?: string;
  attachments: {
    url: string;
    mediaType: string;
  }[];
};

export const create = (params: CreateParams) => {
  const { attachments, ...data } = params;
  return prisma.note.create({
    data: {
      ...data,
      attachments: {
        create: attachments,
      },
    },
    include: {
      replyTo: {
        include: {
          user: true,
        },
      },
    },
  });
};
