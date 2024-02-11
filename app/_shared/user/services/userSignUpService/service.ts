import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

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

export type SignUpUserParams = {
  name?: string;
  preferredUsername: string;
  password: string;
  isAdmin?: boolean;
};

export const signUpUser = async ({
  name,
  preferredUsername,
  password,
  isAdmin,
}: SignUpUserParams) => {
  const keys = createKeys();
  const user = await prisma.user.create({
    data: {
      name,
      preferredUsername,
      host: env.UNSOCIAL_HOST,
      publicKey: keys.publicKey,
      isAdmin,
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
