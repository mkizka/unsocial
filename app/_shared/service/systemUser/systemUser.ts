import assert from "assert";
import crypto from "crypto";

import { signUpUser } from "@/_shared/service/user/signUpUser";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

export const findOrCreateSystemUser = async () => {
  const systemUser = await prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername: env.UNSOCIAL_DOMAIN,
        host: env.UNSOCIAL_DOMAIN,
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
    preferredUsername: env.UNSOCIAL_DOMAIN,
    password: crypto.randomUUID(),
  });
};
