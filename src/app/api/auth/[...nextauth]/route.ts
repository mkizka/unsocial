// Stryker disable all
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { env } from "@/utils/env";
import { formatZodError } from "@/utils/formatZodError";
import { createLogger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";

const logger = createLogger("next-auth");

const credentialsSchema = z.object({
  name: z.string().optional(),
  preferredUsername: z.string().min(1, "ユーザーIDは必須です"),
  password: z.string().min(8, "パスワードは8文字以上にしてください"),
});

const createKeys = () => {
  return crypto.generateKeyPairSync("rsa", {
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
};

export const authOptions: NextAuthOptions = {
  callbacks: {
    async session({ session, token }) {
      session.user = {
        id: token.id,
        privateKey: token.privateKey,
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.privateKey = user.privateKey!;
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
      // @ts-ignore
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          throw new Error(formatZodError(parsedCredentials.error));
        }
        const user = await prisma.user.findUnique({
          where: {
            preferredUsername_host: {
              preferredUsername: parsedCredentials.data.preferredUsername,
              host: env.HOST,
            },
          },
          include: {
            credentials: true,
          },
        });
        if (
          user?.credentials &&
          bcryptjs.compareSync(
            parsedCredentials.data.password,
            user.credentials.hashedPassword,
          )
        ) {
          return { id: user.id, privateKey: user.privateKey };
        }
        const keys = createKeys();
        const newUser = await prisma.user.create({
          data: {
            name: parsedCredentials.data.name ?? null,
            preferredUsername: parsedCredentials.data.preferredUsername,
            host: env.HOST,
            publicKey: keys.publicKey,
            privateKey: keys.privateKey,
            credentials: {
              create: {
                hashedPassword: bcryptjs.hashSync(
                  parsedCredentials.data.password,
                ),
              },
            },
          },
        });
        return { id: newUser.id, privateKey: newUser.privateKey };
      },
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
