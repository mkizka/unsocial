import { z } from "zod";

import { env } from "@/_shared/utils/env";

const activitySchema = z.object({
  "@context": z.unknown().optional(),
});

export const acceptSchema = activitySchema.extend({
  type: z.literal("Accept"),
  id: z.string().url(),
  actor: z.string().url(),
  object: z.object({
    type: z.literal("Follow"),
    actor: z.string().url(),
    object: z.string().url(),
  }),
});

export type AcceptActivity = z.infer<typeof acceptSchema>;

export const announceSchema = activitySchema.extend({
  type: z.literal("Announce"),
  actor: z.string().url(),
  id: z.string().url(),
  object: z.string(),
  published: z.string().datetime(),
  to: z.array(z.string().url()),
  cc: z.array(z.string().url()),
});

export type AnnounceActivity = z.infer<typeof announceSchema>;

export const deleteSchema = activitySchema.extend({
  type: z.literal("Delete"),
  actor: z.string().url(),
  object: z.union([
    // Noteの削除
    z.object({
      type: z.literal("Tombstone"),
      id: z.string().url(),
    }),
    // アカウントの削除
    z.string().url(),
  ]),
  // apRelayService.relayがccを見て配送するので追加するが、
  // Misskey,Mastodonの実装には無いのでoptional
  to: z.array(z.string().url()).optional(),
  cc: z.array(z.string().url()).optional(),
});

export type DeleteActivity = z.infer<typeof deleteSchema>;

export const followSchema = activitySchema.extend({
  type: z.literal("Follow"),
  id: z.string().url(),
  actor: z.string().url(),
  object: z
    .string()
    .url()
    .refine((val) => new URL(val).host === env.UNSOCIAL_HOST, {
      message: "フォロー先が自ホストではありません",
    }),
});

export type FollowActivity = z.infer<typeof followSchema>;

export const likeSchema = activitySchema.extend({
  type: z.literal("Like"),
  id: z.string().url(),
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

export const noteSchema = activitySchema.extend({
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

export const personSchema = activitySchema.extend({
  type: z.union([
    z.literal("Person"),
    z.literal("Service"),
    z.literal("Application"),
  ]),
  id: z.string().url(),
  name: z.string().nullable(),
  summary: z.string().nullable().optional(),
  url: z.string().url().optional(),
  preferredUsername: z.string().min(1),
  endpoints: z
    .object({
      sharedInbox: z.string().url().optional(),
    })
    .optional(),
  following: z.string().url().optional(),
  followers: z.string().url().optional(),
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

export const undoSchema = activitySchema.extend({
  type: z.literal("Undo"),
  id: z.string().url(),
  actor: z.string().url(),
  object: z.union([followSchema, likeSchema, announceSchema]),
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

export const createSchema = activitySchema.extend({
  type: z.literal("Create"),
  id: z.string().url().optional(),
  actor: z.string().url(),
  published: z.string().datetime().optional(),
  to: z.array(z.string().url()).optional(),
  cc: z.array(z.string().url()).optional(),
  object: noteSchema,
});

export type CreateActivity = z.infer<typeof createSchema>;

export type Activity =
  | AcceptActivity
  | AnnounceActivity
  | DeleteActivity
  | FollowActivity
  | LikeActivity
  | NoteActivity
  | PersonActivity
  | UndoActivity
  | CreateActivity;
