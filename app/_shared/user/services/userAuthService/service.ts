import bcryptjs from "bcryptjs";
import { z } from "zod";

import { userSignUpService } from "@/_shared/user/services/userSignUpService";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

const logger = createLogger("userAuthService");

type SignInParams = {
  preferredUsername: string;
  password: string;
};

const signIn = async ({ preferredUsername, password }: SignInParams) => {
  const user = await prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername,
        host: env.UNSOCIAL_HOST,
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

const signUp = async (params: userSignUpService.SignUpUserParams) => {
  const newUser = await userSignUpService.signUpUser(params);
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
  if (parsedCredentials.data.preferredUsername === env.UNSOCIAL_HOST) {
    // 連合時のシステムアカウントで使用するため
    throw new Error("このユーザーIDは使用できません");
  }
  return signUp(parsedCredentials.data);
};
