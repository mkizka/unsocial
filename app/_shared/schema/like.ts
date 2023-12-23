import { z } from "zod";

import { env } from "@/_shared/utils/env";

export const inboxLikeSchema = z.object({
  type: z.literal("Like"),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host === env.UNSOCIAL_HOST, {
      message: "自ホストのノートではありません",
    }),
  content: z.string().optional(),
});

type LikeActivity = z.infer<typeof inboxLikeSchema>;
