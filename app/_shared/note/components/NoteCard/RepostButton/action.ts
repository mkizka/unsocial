"use server";

import type { Prisma } from "@prisma/client";

import { userSessionService } from "@/_shared/user/services/userSessionService";
import { prisma } from "@/_shared/utils/prisma";

const repost = async (userId: string, noteId: string) => {
  const note = await prisma.note.create({
    data: {
      userId,
      quoteId: noteId,
      content: "",
      publishedAt: new Date(),
    },
    include: {
      quote: {
        include: {
          user: true,
        },
      },
    },
  });
  // assert(note.quote, "ノートにquoteが存在しません");
  // if (note.quote.user.host !== env.UNSOCIAL_HOST) {
  //   // TODO: Announceアクティビティを配送する;
  // }
};

const include = {
  quote: {
    include: {
      user: true,
    },
  },
} satisfies Prisma.NoteInclude;

type NoteWithQuote = Prisma.NoteGetPayload<{
  include: typeof include;
}>;

const undoRepost = async (userId: string, noteWithQuote: NoteWithQuote) => {
  await prisma.note.delete({
    where: {
      id: noteWithQuote.id,
    },
  });
  // assert(noteWithQuote.quote, "ノートにquoteが存在しません");
  // if (noteWithQuote.quote.user.host !== env.UNSOCIAL_HOST) {
  //   // TODO: Deleteアクティビティを配送する
  // }
};

export async function action({ noteId }: { noteId: string }) {
  const userId = await userSessionService.getUserId({ redirect: true });
  const existingNoteWithQuote = await prisma.note.findFirst({
    where: {
      userId: userId,
      quote: {
        id: noteId,
      },
    },
    include,
  });
  if (existingNoteWithQuote) {
    await undoRepost(userId, existingNoteWithQuote);
  } else {
    await repost(userId, noteId);
  }
}
