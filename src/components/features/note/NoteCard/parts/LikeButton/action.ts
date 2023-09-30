"use server";
import type { Like, Note, User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";

import { activityStreams } from "@/utils/activitypub";
import { env } from "@/utils/env";
import { getServerSession } from "@/utils/getServerSession";
import { createLogger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";
import { relayActivityToInboxUrl } from "@/utils/relayActivity";

type SessionUser = NonNullable<Session["user"]>;

const include = {
  note: {
    include: {
      user: true,
    },
  },
};

const logger = createLogger("LikeButton");

const like = async (user: SessionUser, input: unknown) => {
  const like = await prisma.like.create({
    data: {
      userId: user.id,
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
      userId: user.id,
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

const unlike = async (user: SessionUser, like: LikeWithNote) => {
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
      userId: user.id,
      inboxUrl: new URL(like.note.user.inboxUrl),
      activity: activityStreams.undo(activityStreams.like(like, like.note.url)),
    });
  }
};

export async function action(data: { noteId: string; content: string }) {
  const session = await getServerSession();
  if (!session?.user) {
    // TODO: エラーを返す方法が実装されたら修正
    return { error: "ログインが必要です" };
  }
  const existingLike = await prisma.like.findFirst({
    where: {
      userId: session.user.id,
      ...data,
    },
    include,
  });
  if (existingLike) {
    await unlike(session.user, existingLike);
  } else {
    await like(session.user, data);
  }
  revalidatePath(`/notes/${data.noteId}`);
}
