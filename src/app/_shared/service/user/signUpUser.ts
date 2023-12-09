import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { env } from "@/utils/env";
import { prisma } from "@/utils/prisma";

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
};

export const signUpUser = async ({
  name,
  preferredUsername,
  password,
}: SignUpUserParams) => {
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
