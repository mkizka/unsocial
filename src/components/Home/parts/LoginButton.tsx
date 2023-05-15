"use client";
import { signIn, signOut } from "next-auth/react";

type Props = {
  isAuthenticated?: boolean;
};

export function SignInOrOutButton({ isAuthenticated }: Props) {
  if (isAuthenticated) {
    return (
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        data-testid="login-button"
        onClick={() => signOut()}
      >
        ログアウト
      </button>
    );
  }
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      data-testid="login-button"
      onClick={() => {
        signIn(
          "email",
          { email: `test@example.com` },
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
