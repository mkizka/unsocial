import { z } from "zod";

import * as inboxAcceptService from "./accept";
import * as inboxCreateService from "./create";
import * as inboxDeleteService from "./delete";
import * as inboxFollowService from "./follow";
import * as inboxLikeService from "./like";
import type { InboxHandler } from "./shared";
import { ActivitySchemaValidationError } from "./shared";
import * as inboxUndoService from "./undo";

const inboxFn = {
  Follow: inboxFollowService,
  Accept: inboxAcceptService,
  Delete: inboxDeleteService,
  Undo: inboxUndoService,
  Create: inboxCreateService,
  Like: inboxLikeService,
} as const;

const keysOf = <T extends object>(obj: T) =>
  Object.keys(obj) as [keyof T, ...(keyof T)[]];

const anyActivitySchema = z
  .object({
    type: z.enum(keysOf(inboxFn)),
  })
  .passthrough();

export const handle: InboxHandler = async (activity, actorUser) => {
  const parsedActivity = anyActivitySchema.safeParse(activity);
  if (!parsedActivity.success) {
    return new ActivitySchemaValidationError(activity, parsedActivity.error);
  }
  await inboxFn[parsedActivity.data.type].handle(
    parsedActivity.data,
    actorUser,
  );
};
