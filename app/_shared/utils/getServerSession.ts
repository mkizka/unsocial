// Stryker disable all
import type { NextAuthOptions } from "next-auth";
import NextAuth, { getServerSession as _getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cache } from "react";

import { userService } from "@/_shared/service/user";

import { createLogger } from "./logger";

const logger = createLogger("next-auth");

const authOptions: NextAuthOptions = {
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
      authorize: userService.authorize,
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const getServerSession = cache(async () => {
  return _getServerSession(authOptions);
});

export const getUser = async () => {
  const session = await getServerSession();
  return session?.user ?? null;
};
