import { z } from "zod";

export const webFingerSchema = z.object({
  links: z.array(
    z.object({
      rel: z.string(),
      href: z.string().url().optional(),
    }),
  ),
});

export type WebFinger = z.infer<typeof webFingerSchema>;
