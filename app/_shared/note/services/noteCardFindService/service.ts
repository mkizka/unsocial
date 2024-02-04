import type { Note } from "@prisma/client";
import { cache } from "react";

import { userSessionService } from "@/_shared/user/services/userSessionService";
import { fullUsername } from "@/_shared/utils/fullUsername";

import { noteCardFindRepository } from "./noteCardFindRepository";

const formatNote = ({
  note,
  userId,
  quotedBy,
}: {
  note: Omit<noteCardFindRepository.NoteCard, "replies" | "replyTo" | "quote">;
  userId: string | null;
  quotedBy?: noteCardFindRepository.NoteCard["user"];
}) => {
  return {
    ...note,
    quotedBy: quotedBy
      ? {
          host: quotedBy.host,
          preferredUsername: quotedBy.preferredUsername,
          name: quotedBy.name,
          url: `/${fullUsername(quotedBy)}`,
        }
      : null,
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
  note: noteCardFindRepository.NoteCard,
  userId: string | null,
): NoteCardWithReplies => {
  if (note.quote) {
    return {
      ...formatNote({
        note: note.quote,
        quotedBy: note.user,
        userId,
      }),
      replyTo: null,
      replies: [],
    };
  }
  return {
    ...formatNote({ note, userId }),
    replyTo: note.replyTo ? formatNote({ note: note.replyTo, userId }) : null,
    replies: note.replies.map((reply) => ({
      ...formatNote({ note: reply, userId }),
      replies: reply.replies,
    })),
  };
};

export const findUniqueNoteCard = cache(async (id: string) => {
  const note = await noteCardFindRepository.findUniqueNoteCard(id);
  if (!note) {
    return null;
  }
  const userId = await userSessionService.getUserId();
  return formatNoteWithReplies(note, userId);
});

export const findManyNoteCards = cache(
  async (params: noteCardFindRepository.FindManyParams) => {
    const notes = await noteCardFindRepository.findManyNoteCards(params);
    if (notes.length === 0) {
      return [];
    }
    const userId = await userSessionService.getUserId();
    return notes.map((note) => formatNoteWithReplies(note, userId));
  },
);
