"use client";
import { signOut } from "next-auth/react";

import { Card } from "@/_shared/ui/components/Card";

export function SignOutForm() {
  return (
    <Card>
      <button
        className="text-accent"
        data-testid="login-button"
        onClick={() => {
          const ok = confirm("ログアウトしますか？");
          if (!ok) return;
          signOut({ redirect: false }).then(() => {
            location.href = "/";
          });
        }}
      >
        ログアウト
      </button>
    </Card>
  );
}
