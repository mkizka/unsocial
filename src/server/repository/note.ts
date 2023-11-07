import type { Prisma } from "@prisma/client";
import { cache } from "react";

import type { DeleteActivity } from "@/server/schema/delete";
import type { NoteActivity } from "@/server/schema/note";
import { prisma } from "@/utils/prisma";

const includeForNoteCard = {
  user: true,
  attachments: true,
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

export const findManyNoteCardsByUserId = cache((userId: string) => {
  return prisma.note.findMany({
    where: { userId },
    include: includeForNoteCard,
    orderBy: {
      createdAt: "desc",
    },
  });
});

export const findByUrl = (url: string) => {
  return prisma.note.findUnique({
    where: { url },
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
    include: includeForNoteCard,
  });
};

type CreateFromActivityParams = {
  activity: NoteActivity;
  userId: string;
  replyToId?: string;
};

export const createFromActivity = cache(
  ({ activity, userId, replyToId }: CreateFromActivityParams) => {
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
  },
);

export const removeByActivity = cache((activity: DeleteActivity) => {
  // urlはユニークでないのでdeleteManyを使うが、実際は一つのノートのみ削除されるはず
  return prisma.note.deleteMany({
    where: {
      url: activity.object.id,
    },
  });
});
