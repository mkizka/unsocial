import { z } from "zod";

import { env } from "@/utils/env";

export const schema = z.object({
  type: z.literal("Like"),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host == env.HOST, {
      message: "自ホストのノートではありません",
    }),
  content: z.string().optional(),
});

export const safeParse = schema.safeParse;

export type Like = z.infer<typeof schema>;
