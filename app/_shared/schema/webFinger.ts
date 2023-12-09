import { z } from "zod";

const selfLinkSchema = z.object({
  rel: z.literal("self"),
  href: z.string().url(),
});

type SelfLink = z.infer<typeof selfLinkSchema>;

const isSelfLink = (link: unknown): link is SelfLink =>
  selfLinkSchema.safeParse(link).success;

export const webFingerSchema = z.object({
  links: z
    .array(z.unknown())
    .refine((links) => links.some(isSelfLink), {
      message: "rel=selfとhrefを持った要素がありません",
    })
    .transform((links) => links.filter(isSelfLink)),
});

type WebFinger = z.infer<typeof webFingerSchema>;
