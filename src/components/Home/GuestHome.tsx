import { signIn } from "next-auth/react";
import type { FC } from "react";

export const GuestHome: FC = () => {
  return (
    <main>
      <button
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
    </main>
  );
};
