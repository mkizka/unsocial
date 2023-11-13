import assert from "assert";
import crypto from "crypto";

import { userRepository } from "@/server/repository";
import { env } from "@/utils/env";

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
