import { z } from "zod";

export const inboxNoteSchema = z.object({
  type: z.literal("Note"),
  id: z.string().url(),
  content: z.string(),
  published: z.string().datetime(),
});

export type NoteActivity = z.infer<typeof inboxNoteSchema>;
