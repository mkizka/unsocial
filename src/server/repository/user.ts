import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { cache } from "react";

import { env } from "@/utils/env";
import { prisma } from "@/utils/prisma";

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
