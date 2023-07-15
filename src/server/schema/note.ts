import { z } from "zod";

export const schema = z.object({
  type: z.literal("Note"),
  id: z.string().url(),
  content: z.string(),
  published: z.string().datetime(),
});

export const safeParse = schema.safeParse;

export type Note = z.infer<typeof schema>;
