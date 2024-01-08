import { z } from "zod";

export const inboxAnnounceSchema = z.object({
  type: z.literal("Announce"),
  id: z.string().url(),
  object: z.string(),
  published: z.string().datetime(),
});

type AnnounceActivity = z.infer<typeof inboxAnnounceSchema>;
