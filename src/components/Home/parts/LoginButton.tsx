"use client";
import { signIn, signOut } from "next-auth/react";

type Props = {
  isAuthenticated?: boolean;
};

export function SignInOrOutButton({ isAuthenticated }: Props) {
  if (isAuthenticated) {
    return (
      <button data-testid="login-button" onClick={() => signOut()}>
        ログアウト
      </button>
    );
  }
  return (
    <button
      data-testid="login-button"
      onClick={() => {
        signIn("credentials", {
          name: "ほげ",
          preferredUsername: "test",
          password: "hogefuga",
        });
      }}
    >
      ログイン
    </button>
  );
}
