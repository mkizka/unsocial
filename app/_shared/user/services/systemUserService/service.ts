import assert from "assert";
import crypto from "crypto";

import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { env } from "@/_shared/utils/env";
import { prisma } from "@/_shared/utils/prisma";

// TODO: exportやめる
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
  return userSignUpService.signUpUser({
    preferredUsername: env.UNSOCIAL_HOST,
    password: crypto.randomUUID(),
  });
};
