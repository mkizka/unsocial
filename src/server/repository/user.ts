import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { cache } from "react";

import type { PersonActivity } from "@/server/schema/person";
import { env } from "@/utils/env";
import { prisma } from "@/utils/prisma";

export const findByActorId = cache((actorId: URL) => {
  return prisma.user.findFirst({
    where: { actorUrl: actorId.toString() },
  });
});

export type FindUniqueParams =
  | {
      preferredUsername: string;
      host: string;
    }
  | { id: string }
  | { actorUrl: string };

export const findUnique = cache((params: FindUniqueParams) => {
  const where =
    "preferredUsername" in params ? { preferredUsername_host: params } : params;
  return prisma.user.findUnique({ where, include: { credential: true } });
});

export const createOrUpdateUser = (
  person: PersonActivity,
  userIdForUpdate?: string,
) => {
  const data = {
    name: person.name,
    preferredUsername: person.preferredUsername,
    host: new URL(person.id).host,
    icon: person.icon?.url ?? null,
    actorUrl: person.id,
    inboxUrl: person.endpoints?.sharedInbox ?? person.inbox,
    publicKey: person.publicKey.publicKeyPem,
    lastFetchedAt: new Date(),
  };
  return userIdForUpdate
    ? prisma.user.update({ where: { id: userIdForUpdate }, data })
    : prisma.user.create({ data });
};

const createKeys = () => {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
};

export type CreateParams = {
  name?: string;
  preferredUsername: string;
  password: string;
};

export const create = async ({
  name,
  preferredUsername,
  password,
}: CreateParams) => {
  const keys = createKeys();
  const user = await prisma.user.create({
    data: {
      name,
      preferredUsername,
      host: env.HOST,
      publicKey: keys.publicKey,
      credential: {
        create: {
          hashedPassword: bcryptjs.hashSync(password),
          privateKey: keys.privateKey,
        },
      },
    },
  });
  return {
    id: user.id,
    privateKey: keys.privateKey,
  };
};

export const updateIcon = async (userId: string, icon: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { icon },
  });
};
