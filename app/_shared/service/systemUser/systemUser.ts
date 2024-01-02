import assert from "assert";
import crypto from "crypto";

import { signUpUser } from "@/_shared/service/user/signUpUser";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

export const findSystemUser = async (options?: { withCredential: boolean }) => {
  return prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername: env.UNSOCIAL_HOST,
        host: env.UNSOCIAL_HOST,
      },
    },
    include: { credential: options?.withCredential ?? false },
  });
};

export const findOrCreateSystemUser = async () => {
  const systemUser = await findSystemUser({ withCredential: true });
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
    preferredUsername: env.UNSOCIAL_HOST,
    password: crypto.randomUUID(),
  });
};
