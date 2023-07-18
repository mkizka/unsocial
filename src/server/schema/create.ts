import { z } from "zod";

import { schema as note } from "./note";

const schema = z.object({
  type: z.literal("Create"),
  actor: z.string().url(),
  object: note,
});

export const safeParse = schema.safeParse;

export type Create = z.infer<typeof schema>;
