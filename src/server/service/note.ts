import type { Document, Note } from "@prisma/client";
import { cache } from "react";

import { noteRepository } from "@/server/repository";
import { fullUsername } from "@/utils/fullUsername";
import { getUser } from "@/utils/getServerSession";

const getAttachmentUrl = (attachments: Document[]) => {
  if (attachments.length === 0) {
    return null;
  }
  const [_, ext] = attachments[0]!.mediaType.split("/");
  // png以外をサポートするなら修正
  if (ext === "png") {
    return `/documents/${attachments[0]!.id}/image.webp`;
  }
  return null;
};

const formatWithoutReplies = (
  note: Omit<noteRepository.NoteCard, "replies">,
  userId?: string,
) => {
  return {
    ...note,
    attachmentUrl: getAttachmentUrl(note.attachments),
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

type FormattedNoteCardWithoutReplies = ReturnType<typeof formatWithoutReplies>;

// 投稿(NoteCard) -> リプライ1(NoteCard) -> リプライ2(Note)までしか遡れない型
export type FormattedNoteCard = FormattedNoteCardWithoutReplies & {
  replies: (FormattedNoteCardWithoutReplies & {
    replies: Note[];
  })[];
};

const format = (
  note: noteRepository.NoteCard,
  userId?: string,
): FormattedNoteCard => {
  return {
    ...formatWithoutReplies(note, userId),
    replies: note.replies.map((reply) => ({
      ...formatWithoutReplies(reply, userId),
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
  return format(note, user?.id);
});

export const findManyNoteCards = cache(
  async (params: noteRepository.FindManyParams) => {
    const notes = await noteRepository.findManyNoteCards(params);
    if (notes.length === 0) {
      return [];
    }
    const user = await getUser();
    return notes.map((note) => formatWithoutReplies(note, user?.id));
  },
);

export const create = async (params: noteRepository.CreateParams) => {
  const note = await noteRepository.create(params);
  const user = await getUser();
  return formatWithoutReplies(note, user?.id);
};
