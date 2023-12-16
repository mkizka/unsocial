"use server";
import type { Like, Note, User } from "@prisma/client";

import { activityStreams } from "@/_shared/utils/activitypub";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";
import { relayActivityToInboxUrl } from "@/_shared/utils/relayActivity";
import { getSessionUserId } from "@/_shared/utils/session";

const include = {
  note: {
    include: {
      user: true,
    },
  },
};

const logger = createLogger("LikeButton");

const like = async (userId: string, input: unknown) => {
  const like = await prisma.like.create({
    data: {
      userId,
      // @ts-expect-error
      ...input,
    },
    include,
  });
  if (like.note.user.host !== env.HOST) {
    if (!like.note.url) {
      logger.error("ノートのURLがありません");
      return;
    }
    if (!like.note.user.inboxUrl) {
      logger.error("ノートユーザーのinboxUrlがありません");
      return;
    }
    await relayActivityToInboxUrl({
      userId,
      inboxUrl: new URL(like.note.user.inboxUrl),
      activity: activityStreams.like(like, like.note.url),
    });
  }
};

type LikeWithNote = Like & {
  note: Note & {
    user: User;
  };
};

const unlike = async (userId: string, like: LikeWithNote) => {
  await prisma.like.delete({
    where: {
      id: like.id,
    },
  });
  if (like.note.user.host !== env.HOST) {
    if (!like.note.url) {
      logger.error("ノートのURLがありません");
      return;
    }
    if (!like.note.user.inboxUrl) {
      logger.error("ノートユーザーのinboxUrlがありません");
      return;
    }
    await relayActivityToInboxUrl({
      userId,
      inboxUrl: new URL(like.note.user.inboxUrl),
      activity: activityStreams.undo(activityStreams.like(like, like.note.url)),
    });
  }
};

export async function action(data: { noteId: string; content: string }) {
  const userId = await getSessionUserId({ redirect: true });
  const existingLike = await prisma.like.findFirst({
    where: {
      userId,
      ...data,
    },
    include,
  });
  if (existingLike) {
    await unlike(userId, existingLike);
  } else {
    await like(userId, data);
  }
}
