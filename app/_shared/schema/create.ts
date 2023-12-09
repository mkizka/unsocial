import { z } from "zod";

import { inboxNoteSchema } from "./note";

export const inboxCreateSchema = z.object({
  type: z.literal("Create"),
  actor: z.string().url(),
  object: inboxNoteSchema,
});

type CreateActivity = z.infer<typeof inboxCreateSchema>;
