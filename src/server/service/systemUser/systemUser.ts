import assert from "assert";
import crypto from "crypto";

import { env } from "@/app/_shared/libs/util/env";
import { userRepository } from "@/server/repository";

export const findOrCreateSystemUser = async () => {
  const systemUser = await userRepository.findUnique({
    preferredUsername: env.HOST,
    host: env.HOST,
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
  return userRepository.create({
    preferredUsername: env.HOST,
    password: crypto.randomUUID(),
  });
};
