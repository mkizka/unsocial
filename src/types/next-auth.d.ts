import type { User as PrismaUser } from "@prisma/client";

// https://next-auth.js.org/getting-started/typescript#main-module
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      privateKey: string;
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface User extends PrismaUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    privateKey: string;
  }
}

export {};
