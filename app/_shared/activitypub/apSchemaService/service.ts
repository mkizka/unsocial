import { z } from "zod";

import { env } from "@/_shared/utils/env";

export const acceptSchema = z.object({
  type: z.literal("Accept"),
  object: z.object({
    type: z.literal("Follow"),
    actor: z.string().url(),
    object: z.string().url(),
  }),
});

export type AcceptActivity = z.infer<typeof acceptSchema>;

export const announceSchema = z.object({
  type: z.literal("Announce"),
  id: z.string().url(),
  object: z.string(),
  published: z.string().datetime(),
});

export type AnnounceActivity = z.infer<typeof announceSchema>;

export const deleteSchema = z.object({
  type: z.literal("Delete"),
  actor: z.string().url(),
  object: z.object({
    type: z.literal("Tombstone"),
    id: z.string().url(),
  }),
});

export type DeleteActivity = z.infer<typeof deleteSchema>;

export const followSchema = z.object({
  type: z.literal("Follow"),
  id: z.string().url().optional(),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host === env.UNSOCIAL_HOST, {
      message: "フォロー先が自ホストではありません",
    }),
});

export type FollowActivity = z.infer<typeof followSchema>;

export const likeSchema = z.object({
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

export type LikeActivity = z.infer<typeof likeSchema>;

export const noteSchema = z.object({
  type: z.literal("Note"),
  id: z.string().url(),
  content: z.string(),
  inReplyTo: z.string().url().nullable().optional(),
  attributedTo: z.string().url(),
  attachment: z
    .array(
      z.object({
        type: z.literal("Document"),
        mediaType: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
  to: z.array(z.string().url()).optional(),
  cc: z.array(z.string().url()).optional(),
  published: z.string().datetime(),
});

export type NoteActivity = z.infer<typeof noteSchema>;

export const personSchema = z.object({
  // MisskeyではServiceが使われることもある
  type: z.union([z.literal("Person"), z.literal("Service")]),
  id: z.string().url(),
  name: z.string().nullable(),
  summary: z.string().nullable(),
  url: z.string().url(),
  preferredUsername: z.string().min(1),
  endpoints: z
    .object({
      sharedInbox: z.string().url().optional(),
    })
    .optional(),
  following: z.string().url(),
  followers: z.string().url(),
  featured: z.string().url().optional(),
  inbox: z.string().url(),
  outbox: z.string().url().optional(),
  icon: z
    .object({
      type: z.literal("Image"),
      url: z.string(),
    })
    .nullable()
    .optional(),
  publicKey: z.object({
    id: z.string().url(),
    owner: z.string().url(),
    publicKeyPem: z.string(),
  }),
});

export type PersonActivity = z.infer<typeof personSchema>;

export const undoSchema = z.object({
  type: z.literal("Undo"),
  actor: z.string().url(),
  object: z.union([followSchema, likeSchema]),
});

export type UndoActivity = z.infer<typeof undoSchema>;

const selfLinkSchema = z.object({
  rel: z.literal("self"),
  href: z.string().url(),
});

export type SelfLink = z.infer<typeof selfLinkSchema>;

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

export type WebFinger = z.infer<typeof webFingerSchema>;

export const createSchema = z.object({
  type: z.literal("Create"),
  id: z.string().url().optional(),
  actor: z.string().url(),
  published: z.string().datetime().optional(),
  to: z.array(z.string().url()).optional(),
  cc: z.array(z.string().url()).optional(),
  object: noteSchema,
});

export type CreateActivity = z.infer<typeof createSchema>;
