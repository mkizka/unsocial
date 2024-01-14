"use client";
import { signOut } from "next-auth/react";

import { Card } from "@/_shared/ui/Card";

export function SignOutForm() {
  return (
    <Card>
      <button
        className="text-accent"
        data-testid="login-button"
        onClick={async () => {
          const ok = confirm("ログアウトしますか？");
          if (!ok) return;
          await signOut({ redirect: false }).then(() => {
            location.href = "/";
          });
        }}
      >
        ログアウト
      </button>
    </Card>
  );
}
