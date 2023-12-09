import bcryptjs from "bcryptjs";
import { cache } from "react";
import { z } from "zod";

import { env } from "@/app/_shared/utils/env";
import { createLogger } from "@/app/_shared/utils/logger";
import { prisma } from "@/app/_shared/utils/prisma";

import {
  findOrFetchUserById,
  findOrFetchUserByWebFinger,
} from "./findOrFetchUser";
import { findOrFetchUserByActor as _findOrFetchUserByActor } from "./findOrFetchUser";
import { parseUserKey } from "./parseUserKey";
import type { SignUpUserParams } from "./signUpUser";
import { signUpUser } from "./signUpUser";

const logger = createLogger("userService");

export const findOrFetchUserByActor = cache(_findOrFetchUserByActor);

export const findOrFetchUserByKey = cache(async (userKey: string) => {
  const parsed = parseUserKey(userKey);
  if ("id" in parsed) {
    return findOrFetchUserById(parsed.id);
  }
  if ("preferredUsername" in parsed) {
    return findOrFetchUserByWebFinger(parsed);
  }
  return parsed;
});

type SignInParams = {
  preferredUsername: string;
  password: string;
};

const signIn = async ({ preferredUsername, password }: SignInParams) => {
  const user = await prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername,
        host: env.HOST,
      },
    },
    include: { credential: true },
  });
  if (!user) {
    throw new Error("ユーザーが見つかりません");
  }
  if (!user.credential) {
    logger.error(`credentialsが見つかりませんでした: ${user.id}`);
    throw new Error("予期しないエラーが発生しました");
  }
  if (!bcryptjs.compareSync(password, user.credential.hashedPassword)) {
    throw new Error("パスワードが間違っています");
  }
  return { id: user.id };
};

const signUp = async (params: SignUpUserParams) => {
  const newUser = await signUpUser(params);
  return { id: newUser.id };
};

const credentialsSchema = z.object({
  action: z.union([z.literal("signIn"), z.literal("signUp")], {
    errorMap: () => ({ message: "不正な操作です" }),
  }),
  name: z.string().optional(),
  preferredUsername: z.string().min(1, "ユーザーIDは必須です"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
});

export const authorize = async (credentials: unknown) => {
  const parsedCredentials = credentialsSchema.safeParse(credentials);
  if (!parsedCredentials.success) {
    throw new Error(parsedCredentials.error.issues[0]?.message);
  }
  if (parsedCredentials.data.action === "signIn") {
    return signIn(parsedCredentials.data);
  }
  return signUp(parsedCredentials.data);
};
