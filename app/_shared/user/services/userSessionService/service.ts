import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import type { NextAuthOptions } from "next-auth";
import NextAuth, { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cache } from "react";

import { userAuthService } from "@/_shared/user/services/userAuthService";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";
import { prisma } from "@/_shared/utils/prisma";

const logger = createLogger("next-auth");

const authOptions: NextAuthOptions = {
  secret: env.UNSOCIAL_SECRET,
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
      // CredentialsProviderのみ使用する場合はNEXTAUTH_URLは不要なので、警告は無視する
      if (code === "NEXTAUTH_URL") return;
      logger.warn(code);
    },
  },
  providers: [
    CredentialsProvider({
      // authorizeの型エラーを解消するために必要
      // フォーム生成はしないので値は空にしておく
      credentials: {},
      authorize: userAuthService.authorize,
    }),
  ],
};

export const handler = NextAuth(authOptions);

const getSessionUserIdOrNull = cache(async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
});

const getSessionUserOrNull = cache(async () => {
  const sessionUserId = await getSessionUserIdOrNull();
  if (!sessionUserId) {
    return null;
  }
  const sessionUser = await prisma.user.findUnique({
    where: {
      id: sessionUserId,
    },
  });
  return sessionUser ?? null;
});

export const getSessionUserId = async <T extends boolean>(params?: {
  redirect: T;
}) => {
  const userId = await getSessionUserIdOrNull();
  if (!userId && params?.redirect) {
    redirect("/auth");
  }
  return userId as T extends true ? string : string | null;
};

export const getSessionUser = async <T extends boolean>(params?: {
  redirect: T;
}) => {
  const user = await getSessionUserOrNull();
  if (!user && params?.redirect) {
    redirect("/auth");
  }
  return user as T extends true ? User : User | null;
};
