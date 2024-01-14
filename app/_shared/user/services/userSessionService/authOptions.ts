// Stryker disable all
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { userAuthService } from "@/_shared/user/services/userAuthService";
import { env } from "@/_shared/utils/env";
import { createLogger } from "@/_shared/utils/logger";

const logger = createLogger("next-auth");

export const authOptions: NextAuthOptions = {
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
