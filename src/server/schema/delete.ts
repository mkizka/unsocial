import { z } from "zod";

const schema = z.object({
  type: z.literal("Delete"),
  actor: z.string().url(),
  object: z.object({
    type: z.literal("Tombstone"),
    id: z.string().url(),
  }),
});

export const safeParse = schema.safeParse;

export type Delete = z.infer<typeof schema>;
