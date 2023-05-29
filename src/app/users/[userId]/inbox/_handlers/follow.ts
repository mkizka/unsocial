import { z } from "zod";

import { queue } from "@/server/background/queue";
import { env } from "@/utils/env";
import { findUserByActorId } from "@/utils/findUserByActorId";
import { formatZodError } from "@/utils/formatZodError";
import { prisma } from "@/utils/prisma";

import type { InboxFunction } from "./types";

const followActivitySchema = z
  .object({
    type: z.literal("Follow"),
    actor: z.string().url(),
    object: z
      .string()
      .url()
      .transform((val, ctx) => {
        if (new URL(val).host != env.HOST) {
          ctx.addIssue({
            code: "custom",
            message: "フォロー先が自ホストではありません",
          });
          return z.NEVER;
        }
        return val;
      }),
  })
  .passthrough();

export const follow: InboxFunction = async (activity, actorUser) => {
  const parsedFollow = followActivitySchema.safeParse(activity);
  if (!parsedFollow.success) {
    return {
      status: 400,
      message: "検証失敗: " + formatZodError(parsedFollow.error),
    };
  }
  const followee = await findUserByActorId(new URL(parsedFollow.data.object));
  if (!followee) {
    return {
      status: 400,
      message: "フォローリクエストで指定されたフォロイーが存在しませんでした",
    };
  }
  if (!followee.privateKey) {
    // 自ホストのユーザーなら秘密鍵を持っているはずなので、異常な動作
    return {
      status: 503,
      message:
        "フォローリクエストで指定されたフォロイーが秘密鍵を持っていませんでした",
    };
  }
  await prisma.follow.create({
    data: {
      followeeId: followee.id,
      followerId: actorUser.id,
    },
  });
  queue.push({
    runner: "relayActivity",
    params: {
      sender: {
        id: followee.id,
        privateKey: followee.privateKey,
      },
      activity: {
        type: "Accept",
        actor: new URL(`https://${env.HOST}/users/${followee.id}`),
        object: {
          ...parsedFollow.data,
          actor: new URL(parsedFollow.data.actor),
          object: new URL(parsedFollow.data.object),
        },
      },
    },
  });
  return { status: 200, message: "完了: フォロー" };
};
