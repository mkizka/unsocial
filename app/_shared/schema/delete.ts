import { z } from "zod";

export const inboxDeleteSchema = z.object({
  type: z.literal("Delete"),
  actor: z.string().url(),
  object: z.object({
    type: z.literal("Tombstone"),
    id: z.string().url(),
  }),
});

type DeleteActivity = z.infer<typeof inboxDeleteSchema>;
