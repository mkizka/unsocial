import bcryptjs from "bcryptjs";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { userRepository } from "@/server/repository";
import { env } from "@/utils/env";
import { createLogger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";

const logger = createLogger("next-auth");

const credentialsSchema = z.object({
  action: z.union([z.literal("signIn"), z.literal("signUp")], {
    errorMap: () => ({ message: "不正な操作です" }),
  }),
  name: z.string().optional(),
  preferredUsername: z.string().min(1, "ユーザーIDは必須です"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
});

const signIn = async (credentials: z.infer<typeof credentialsSchema>) => {
  const user = await prisma.user.findUnique({
    where: {
      preferredUsername_host: {
        preferredUsername: credentials.preferredUsername,
        host: env.HOST,
      },
    },
    include: {
      credential: true,
    },
  });
  if (!user) {
    throw new Error("ユーザーが見つかりません");
  }
  if (!user.credential) {
    logger.error(`credentialsが見つかりませんでした: ${user.id}`);
    throw new Error("予期しないエラーが発生しました");
  }
  if (
    bcryptjs.compareSync(credentials.password, user.credential.hashedPassword)
  ) {
    return { id: user.id };
  }
  throw new Error("パスワードが間違っています");
};

const signUp = async (credentials: z.infer<typeof credentialsSchema>) => {
  const newUser = await userRepository.create(credentials);
  return { id: newUser.id };
};

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

// Stryker disable all
export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, token }) {
      session.user = {
        id: token.id,
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  logger: {
    error(code, message) {
      logger.error(`${code} ${JSON.stringify(message)}`);
    },
    warn(code) {
      logger.warn(code);
    },
  },
  providers: [
    CredentialsProvider({
      // authorizeの型エラーを解消するために必要
      // フォーム生成はしないので値は空にしておく
      credentials: {},
      authorize,
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
