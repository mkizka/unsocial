import type { Note } from "@prisma/client";
import { cache } from "react";

import { noteRepository } from "@/server/repository";
import { fullUsername } from "@/utils/fullUsername";
import { getUser } from "@/utils/getServerSession";
import { prisma } from "@/utils/prisma";

const formatNote = (
  note: Omit<noteRepository.NoteCard, "replies" | "replyTo">,
  userId?: string,
) => {
  return {
    ...note,
    attachmentUrls: note.attachments.map(
      (attachment) => `/documents/${attachment.id}/image.webp`,
    ),
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

export type NoteCard = ReturnType<typeof formatNote>;

// 投稿(NoteCard) -> リプライ1(NoteCard) -> リプライ2(Note)までしか遡れない型
export type NoteCardWithReplies = NoteCard & {
  replyTo: NoteCard | null;
  replies: (NoteCard & {
    replies: Note[];
  })[];
};

const formatNoteWithReplies = (
  note: noteRepository.NoteCard,
  userId?: string,
): NoteCardWithReplies => {
  return {
    ...formatNote(note, userId),
    replyTo: note.replyTo && formatNote(note.replyTo, userId),
    replies: note.replies.map((reply) => ({
      ...formatNote(reply, userId),
      replies: reply.replies,
    })),
  };
};

export const findUniqueNoteCard = cache(async (id: string) => {
  const note = await noteRepository.findUniqueNoteCard(id);
  if (!note) {
    return null;
  }
  const user = await getUser();
  return formatNoteWithReplies(note, user?.id);
});

export const findManyNoteCards = cache(
  async (params: noteRepository.FindManyParams) => {
    const notes = await noteRepository.findManyNoteCards(params);
    if (notes.length === 0) {
      return [];
    }
    const user = await getUser();
    return notes.map((note) => formatNoteWithReplies(note, user?.id));
  },
);

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
