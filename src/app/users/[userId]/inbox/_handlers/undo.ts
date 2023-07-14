import type { User } from "@prisma/client";
import { z } from "zod";

import { userService } from "@/server/service";
import { env } from "@/utils/env";
import { stringifyZodError } from "@/utils/formatZodError";
import { prisma } from "@/utils/prisma";

import type { InboxFunction } from "./types";

const followActivitySchema = z.object({
  type: z.literal("Follow"),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host == env.HOST, {
      message: "フォロー先が自ホストではありません",
    }),
});

const likeActivitySchema = z.object({
  type: z.literal("Like"),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host == env.HOST, {
      message: "自ホストのノートではありません",
    }),
  content: z.string().optional(),
});

const undoActivitySchema = z.object({
  type: z.literal("Undo"),
  actor: z.string().url(),
  object: z.union([followActivitySchema, likeActivitySchema]),
});

const undoFollow = async (actorUser: User, undoActorId: URL) => {
  const followee = await userService.findUserByActorId(undoActorId);
  if (!followee) {
    return {
      status: 400,
      message:
        "アンフォローリクエストで指定されたフォロイーが存在しませんでした",
    };
  }
  await prisma.follow.delete({
    where: {
      followeeId_followerId: {
        followeeId: followee.id,
        followerId: actorUser.id,
      },
    },
  });
  return {
    status: 200,
    message: "完了: アンフォロー",
  };
};

// TODO: service化してlike.tsと共通にする
const resolveNoteId = (objectId: URL) => {
  if (!objectId.pathname.startsWith("/notes/")) {
    return null;
  }
  return objectId.pathname.split("/")[2];
};

const undoLike = async (actorUser: User, undoObjectId: URL) => {
  const noteId = resolveNoteId(undoObjectId);
  if (!noteId) {
    return {
      status: 400,
      message: "activityからいいね削除対象のノートIDを取得できませんでした",
    };
  }
  await prisma.like.deleteMany({
    where: {
      noteId,
      userId: actorUser.id,
    },
  });
  return { status: 200, message: "完了: いいね削除" };
};

export const undo: InboxFunction = async (activity, actorUser) => {
  const parsedUndo = undoActivitySchema.safeParse(activity);
  if (!parsedUndo.success) {
    return {
      status: 400,
      message: stringifyZodError(parsedUndo.error, activity),
    };
  }
  const undoObject = parsedUndo.data.object;
  if (undoObject.type === "Follow") {
    return undoFollow(actorUser, new URL(undoObject.object));
  }
  return undoLike(actorUser, new URL(undoObject.object));
};
