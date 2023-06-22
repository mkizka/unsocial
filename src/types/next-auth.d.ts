// https://next-auth.js.org/getting-started/typescript#main-module
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export {};
