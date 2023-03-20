import crypto from "crypto";

import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
 
import { prisma } from "../../../server/db";
import { env } from "../../../utils/env";

export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.privateKey = user.privateKey;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // 以下のコマンドの内容と同じように生成する
      //   openssl genrsa -out private.pem 2048
      //   openssl rsa -in private.pem -outform PEM -pubout -out public.pem
      // 参考: https://blog.joinmastodon.org/2018/06/how-to-implement-a-basic-activitypub-server/
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          publicKey,
          privateKey,
        },
      });
    },
  },
  adapter: {
    ...PrismaAdapter(prisma),
    createUser: (data) =>
      // 謎の型エラー
      // @ts-ignore
      prisma.user.create({
        // @ts-ignore
        data: {
          ...data,
          host: env.HOST,
        },
      }),
  },
  providers: [
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASS,
        },
      },
      from: env.EMAIL_FROM,
    }),
  ],
};

export default NextAuth(authOptions);
