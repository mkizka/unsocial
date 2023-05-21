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
        signIn(
          "email",
          { email: `${location.hostname}@example.com` },
          {
            name: "テスト",
            preferredUsername: "test",
          }
        );
      }}
    >
      ログイン
    </button>
  );
}
