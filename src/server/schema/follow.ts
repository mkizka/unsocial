import { z } from "zod";

import { env } from "@/utils/env";

export const schema = z.object({
  type: z.literal("Follow"),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host == env.HOST, {
      message: "フォロー先が自ホストではありません",
    }),
});

export const safeParse = schema.safeParse;

export type Follow = z.infer<typeof schema>;
