import { z } from "zod";

import { formatZodError } from "@/utils/formatZodError";

import { accept } from "./accept";
import { create } from "./create";
import { delete_ } from "./delete";
import { follow } from "./follow";
import { like } from "./like";
import type { InboxFunction } from "./types";
import { undo } from "./undo";

const inboxFn = {
  Follow: follow,
  Accept: accept,
  Delete: delete_,
  Undo: undo,
  Create: create,
  Like: like,
} as const;

const keysOf = <T extends object>(obj: T) =>
  Object.keys(obj) as [keyof T, ...(keyof T)[]];

const anyActivitySchema = z
  .object({
    type: z.enum(keysOf(inboxFn)),
    actor: z.string().url(),
  })
  .passthrough();

export const inbox: InboxFunction = async (activity, actorUser) => {
  const parsedActivity = anyActivitySchema.safeParse(activity);
  if (!parsedActivity.success) {
    return {
      status: 400,
      message: "検証失敗: " + formatZodError(parsedActivity.error),
    };
  }
  return inboxFn[parsedActivity.data.type](parsedActivity.data, actorUser);
};
