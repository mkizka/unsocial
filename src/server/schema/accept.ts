import { z } from "zod";

const schema = z.object({
  type: z.literal("Accept"),
  object: z.object({
    type: z.literal("Follow"),
    actor: z.string().url(),
    object: z.string().url(),
  }),
});

export const safeParse = schema.safeParse;

export type Accept = z.infer<typeof schema>;
