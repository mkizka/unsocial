import { z } from "zod";

export const inboxPersonSchema = z.object({
  // MisskeyではServiceが使われることもある
  type: z.union([z.literal("Person"), z.literal("Service")]),
  id: z.string().url(),
  name: z.string().nullable(),
  preferredUsername: z.string().min(1),
  endpoints: z
    .object({
      sharedInbox: z.string().url().optional(),
    })
    .optional(),
  inbox: z.string().url(),
  icon: z
    .object({
      url: z.string(),
    })
    .nullable()
    .optional(),
  publicKey: z.object({
    publicKeyPem: z.string(),
  }),
});

export type PersonActivity = z.infer<typeof inboxPersonSchema>;
