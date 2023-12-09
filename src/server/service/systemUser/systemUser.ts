import assert from "assert";
import crypto from "crypto";

import { signUpUser } from "@/server/service/user/signUpUser";
import { env } from "@/utils/env";
import { prisma } from "@/utils/prisma";

export const findOrCreateSystemUser = async () => {
  const systemUser = await prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername: env.HOST,
        host: env.HOST,
      },
    },
    include: { credential: true },
  });
  if (systemUser) {
    assert(
      systemUser.credential?.privateKey,
      "システムユーザーの秘密鍵がありませんでした",
    );
    return {
      id: systemUser.id,
      privateKey: systemUser.credential.privateKey,
    };
  }
  return signUpUser({
    preferredUsername: env.HOST,
    password: crypto.randomUUID(),
  });
};
