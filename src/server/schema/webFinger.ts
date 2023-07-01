import { z } from "zod";

const schema = z.object({
  links: z.array(
    z.object({
      rel: z.string(),
      href: z.string().url().optional(),
    })
  ),
});

export const safeParse = schema.safeParse;

export type WebFinger = z.infer<typeof schema>;
