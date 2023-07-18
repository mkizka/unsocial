import { z } from "zod";

import { schema as follow } from "./follow";
import { schema as like } from "./like";

const schema = z.object({
  type: z.literal("Undo"),
  actor: z.string().url(),
  object: z.union([follow, like]),
});

export const safeParse = schema.safeParse;

export type Undo = z.infer<typeof schema>;
