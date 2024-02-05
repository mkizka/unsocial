"use server";

import type { Prisma } from "@prisma/client";
import assert from "assert";

import {
  relayActivityToFollowers,
  relayActivityToInboxUrl,
} from "@/_shared/activitypub/apRelayService/service";
import { userSessionService } from "@/_shared/user/services/userSessionService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { env } from "@/_shared/utils/env";
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
  assert(note.quote, "ノートにquoteが存在しません");
  if (note.quote.user.host !== env.UNSOCIAL_HOST) {
    assert(
      note.quote.user.inboxUrl,
      "リポスト先のユーザーにinboxUrlがありません",
    );
    const activity = activityStreams.announce(note);
    await relayActivityToInboxUrl({
      userId,
      activity,
      inboxUrl: new URL(note.quote.user.inboxUrl),
    });
    await relayActivityToFollowers({
      userId,
      activity,
    });
  }
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
