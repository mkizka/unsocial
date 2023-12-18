"use client";
import { signOut } from "next-auth/react";

import { Card } from "@/_shared/components/ui/Card";

export function SignOutForm() {
  return (
    <Card>
      <button
        className="text-accent"
        data-testid="login-button"
        onClick={() => {
          const ok = confirm("ログアウトしますか？");
          if (!ok) return;
          signOut();
        }}
      >
        ログアウト
      </button>
    </Card>
  );
}
