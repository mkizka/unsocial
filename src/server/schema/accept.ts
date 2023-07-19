import { z } from "zod";

export const inboxAcceptSchema = z.object({
  type: z.literal("Accept"),
  object: z.object({
    type: z.literal("Follow"),
    actor: z.string().url(),
    object: z.string().url(),
  }),
});

export type AcceptActivity = z.infer<typeof inboxAcceptSchema>;
