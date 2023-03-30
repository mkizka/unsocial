import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import type { FC } from "react";

type Props = {
  user: NonNullable<Session["user"]>;
};

export const UserHome: FC<Props> = ({ user }) => {
  return (
    <main>
      <p data-test-id="is-logged-in">{user.name}でログイン中</p>
      <button data-test-id="login-button" onClick={() => signOut()}>
        ログアウト
      </button>
    </main>
  );
};
