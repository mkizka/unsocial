import crypto from "crypto";
import { z } from "zod";

import { userService } from "@/server/service";
import { env } from "@/utils/env";
import { formatZodError } from "@/utils/formatZodError";
import { prisma } from "@/utils/prisma";
import { relayActivityToInboxUrl } from "@/utils/relayActivity";

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
  const followee = await userService.findUserByActorId(
    new URL(parsedFollow.data.object),
  );
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
      message: `フォローリクエストで指定されたフォロイー(@${followee.preferredUsername}@${followee.host})が秘密鍵を持っていませんでした`,
    };
  }
  if (!actorUser.inboxUrl) {
    // 他ホストのユーザーならinboxUrlを持っているはずなので、異常な動作
    return {
      status: 503,
      message:
        "フォローリクエストを送信したユーザーがinboxUrlを持っていませんでした",
    };
  }
  await prisma.follow.create({
    data: {
      followeeId: followee.id,
      followerId: actorUser.id,
      status: "ACCEPTED",
    },
  });
  await relayActivityToInboxUrl({
    inboxUrl: new URL(actorUser.inboxUrl),
    sender: {
      id: followee.id,
      privateKey: followee.privateKey,
    },
    activity: {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      // TODO: いいの？
      id: new URL(`https://${env.HOST}/${crypto.randomUUID()}`),
      type: "Accept",
      actor: new URL(`https://${env.HOST}/users/${followee.id}/activity`),
      object: {
        ...parsedFollow.data,
        actor: new URL(parsedFollow.data.actor),
        object: new URL(parsedFollow.data.object),
      },
    },
  });
  return { status: 200, message: "完了: フォロー" };
};
