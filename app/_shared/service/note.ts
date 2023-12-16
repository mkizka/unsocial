import type { Note } from "@prisma/client";
import { cache } from "react";

import { fullUsername } from "@/_shared/utils/fullUsername";
import { getSessionUserId } from "@/_shared/utils/getSessionUser";
import { prisma } from "@/_shared/utils/prisma";

import { noteCardService } from "./noteCard";

const formatNote = (
  note: Omit<noteCardService.NoteCard, "replies" | "replyTo">,
  userId: string | null,
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
type NoteCardWithReplies = NoteCard & {
  replyTo: NoteCard | null;
  replies: (NoteCard & {
    replies: Note[];
  })[];
};

const formatNoteWithReplies = (
  note: noteCardService.NoteCard,
  userId: string | null,
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
  const note = await noteCardService.findUniqueNoteCard(id);
  if (!note) {
    return null;
  }
  const userId = await getSessionUserId();
  return formatNoteWithReplies(note, userId);
});

export const findManyNoteCards = cache(
  async (params: noteCardService.FindManyParams) => {
    const notes = await noteCardService.findManyNoteCards(params);
    if (notes.length === 0) {
      return [];
    }
    const userId = await getSessionUserId();
    return notes.map((note) => formatNoteWithReplies(note, userId));
  },
);

type CreateParams = {
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
