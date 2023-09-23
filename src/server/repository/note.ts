import { cache } from "react";

import type { DeleteActivity } from "@/server/schema/delete";
import type { NoteActivity } from "@/server/schema/note";
import { prisma } from "@/utils/prisma";

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

export type FindManyParams = {
  count: number;
  since?: Date;
  until?: Date;
};

export const findManyNoteCards = cache((params: FindManyParams) => {
  return prisma.note.findMany({
    where: {
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

export type CreateParams = {
  userId: string;
  content: string;
  publishedAt: Date;
};

export const create = (params: CreateParams) => {
  return prisma.note.create({
    data: params,
    include: includeForNoteCard,
  });
};

type CreateFromActivityParams = {
  activity: NoteActivity;
  userId: string;
};

export const createFromActivity = cache(
  ({ activity, userId }: CreateFromActivityParams) => {
    return prisma.note.create({
      data: {
        userId,
        url: activity.id,
        content: activity.content,
        publishedAt: activity.published,
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
