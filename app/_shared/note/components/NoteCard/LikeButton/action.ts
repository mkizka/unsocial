"use server";
import type { Like, Note, User } from "@prisma/client";
import assert from "assert";

import { apRelayService } from "@/_shared/activitypub/apRelayService";
import { userSessionService } from "@/_shared/user/services/userSessionService";
import { activityStreams } from "@/_shared/utils/activitypub";
import { prisma } from "@/_shared/utils/prisma";

const include = {
  note: {
    include: {
      user: true,
    },
  },
};

const like = async (userId: string, noteId: string, content: string) => {
  const [like] = await prisma.$transaction([
    prisma.like.create({
      data: {
        userId,
        noteId,
        content,
      },
      include,
    }),
    prisma.note.update({
      where: {
        id: noteId,
      },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    }),
  ]);
  if (like.note.user.inboxUrl) {
    assert(like.note.url, "ノートのURLがありません");
    await apRelayService.relay({
      userId,
      activity: activityStreams.like(like, like.note.url),
      inboxUrl: like.note.user.inboxUrl,
    });
  }
};

type LikeWithNote = Like & {
  note: Note & {
    user: User;
  };
};

const unlike = async (userId: string, like: LikeWithNote) => {
  await prisma.$transaction([
    prisma.like.delete({
      where: {
        id: like.id,
      },
    }),
    prisma.note.update({
      where: {
        id: like.noteId,
      },
      data: {
        likesCount: {
          decrement: 1,
        },
      },
    }),
  ]);
  if (like.note.user.inboxUrl) {
    assert(like.note.url, "ノートのURLがありません");
    await apRelayService.relay({
      userId,
      activity: activityStreams.undo(activityStreams.like(like, like.note.url)),
      inboxUrl: like.note.user.inboxUrl,
    });
  }
};

export async function action({
  noteId,
  content,
}: {
  noteId: string;
  content: string;
}) {
  const userId = await userSessionService.getUserId({ redirect: true });
  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      noteId,
      content,
    },
    include,
  });
  if (existingLike) {
    await unlike(userId, existingLike);
  } else {
    await like(userId, noteId, content);
  }
}
