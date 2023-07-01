"use client";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button data-testid="login-button" onClick={() => signOut()}>
      ログアウト
    </button>
  );
}
