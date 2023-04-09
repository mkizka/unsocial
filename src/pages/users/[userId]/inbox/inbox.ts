import { json } from "next-runtime";
import { z } from "zod";

import { logger } from "../../../../utils/logger";
import { accept } from "./accept";
import { delete_ } from "./delete";
import { follow } from "./follow";
import { note } from "./note";
import type { InboxFunction } from "./types";

const inboxFn = {
  Follow: follow,
  Accept: accept,
  Delete: delete_,
} as const;

// TODO: 上のinboxにまとめる
const undoInbox = {
  Follow: follow,
};

// TODO: 上のinboxにまとめる
const createInbox = {
  Note: note,
};

const keysOf = <T extends object>(obj: T) =>
  Object.keys(obj) as [keyof T, ...(keyof T)[]];

const anyActivitySchema = z.union([
  z
    .object({
      type: z.enum(keysOf(inboxFn)),
      actor: z.string().url(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal("Undo"),
      actor: z.string().url(),
      object: z
        .object({
          type: z.enum(keysOf(undoInbox)),
        })
        .passthrough(),
    })
    .passthrough(),
  z
    .object({
      type: z.literal("Create"),
      actor: z.string().url(),
      object: z
        .object({
          type: z.enum(keysOf(createInbox)),
        })
        .passthrough(),
    })
    .passthrough(),
]);

export const inbox: InboxFunction = async (activity, actorUser) => {
  const parsedActivity = anyActivitySchema.safeParse(activity);
  if (!parsedActivity.success) {
    logger.info(`検証エラー: ${JSON.stringify(activity)}`);
    return json({}, 400);
  }
  if (parsedActivity.data.type == "Undo") {
    return undoInbox[parsedActivity.data.object.type](
      parsedActivity.data.object,
      actorUser,
      { undo: true }
    );
  }
  if (parsedActivity.data.type == "Create") {
    return createInbox[parsedActivity.data.object.type](
      parsedActivity.data.object,
      actorUser
    );
  }
  return inboxFn[parsedActivity.data.type](parsedActivity.data, actorUser);
};
