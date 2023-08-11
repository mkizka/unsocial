interface SessionUser {
  id: string;
}

// https://next-auth.js.org/getting-started/typescript#main-module
declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface User extends SessionUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends SessionUser {}
}

export {};
