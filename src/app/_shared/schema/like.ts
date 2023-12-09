import { z } from "zod";

import { env } from "@/app/_shared/utils/env";

export const inboxLikeSchema = z.object({
  type: z.literal("Like"),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host === env.HOST, {
      message: "自ホストのノートではありません",
    }),
  content: z.string().optional(),
});

export type LikeActivity = z.infer<typeof inboxLikeSchema>;
