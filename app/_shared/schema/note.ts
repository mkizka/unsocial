import { z } from "zod";

export const inboxNoteSchema = z.object({
  type: z.literal("Note"),
  id: z.string().url(),
  content: z.string(),
  inReplyTo: z.string().url().nullable().optional(),
  attributedTo: z.string().url(),
  attachment: z
    .array(
      z.object({
        type: z.literal("Document"),
        mediaType: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
  published: z.string().datetime(),
});

export type NoteActivity = z.infer<typeof inboxNoteSchema>;