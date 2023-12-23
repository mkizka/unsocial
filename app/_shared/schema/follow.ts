import { z } from "zod";

import { env } from "@/_shared/utils/env";

export const inboxFollowSchema = z.object({
  type: z.literal("Follow"),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host === env.UNSOCIAL_DOMAIN, {
      message: "フォロー先が自ホストではありません",
    }),
});

type FollowActivity = z.infer<typeof inboxFollowSchema>;
