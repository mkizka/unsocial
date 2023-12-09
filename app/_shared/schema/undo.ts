import { z } from "zod";

import { inboxFollowSchema } from "./follow";
import { inboxLikeSchema } from "./like";

export const inboxUndoSchema = z.object({
  type: z.literal("Undo"),
  actor: z.string().url(),
  object: z.union([inboxFollowSchema, inboxLikeSchema]),
});

export type UndoActivity = z.infer<typeof inboxUndoSchema>;
