import type { Like } from "@prisma/client";

import { activityStreams } from "@/utils/activitypub";
import { env } from "@/utils/env";
import { getServerSession } from "@/utils/getServerSession";
import { logger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";
import { relayActivity } from "@/utils/relayActivity";

type User = {
  id: string;
  privateKey: string;
};

const include = {
  note: {
    select: {
      user: {
        select: {
          host: true,
        },
      },
      url: true,
    },
  },
};

const like = async (user: User, input: unknown) => {
  const like = await prisma.like.create({
    data: {
      userId: user.id,
      // @ts-expect-error
      ...input,
    },
    include,
  });
  if (like.note.user.host != env.HOST) {
    if (!like.note.url) {
      logger.error("ノートのURLがありません");
      return;
    }
    relayActivity({
      sender: user,
      activity: activityStreams.like(like, like.note.url),
    });
  }
};

type LikeWithNote = Like & {
  note: {
    url: string | null;
    user: {
      host: string;
    };
  };
};

const unlike = async (user: User, like: LikeWithNote) => {
  await prisma.like.delete({
    where: {
      id: like.id,
    },
  });
  if (like.note.user.host != env.HOST) {
    if (!like.note.url) {
      logger.error("ノートのURLがありません");
      return;
    }
    relayActivity({
      sender: user,
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
}
