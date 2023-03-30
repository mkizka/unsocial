import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import type { FC } from "react";

type Props = {
  user: NonNullable<Session["user"]>;
};

export const UserHome: FC<Props> = ({ user }) => {
  return (
    <main>
      <p>{user.name}でログイン中</p>
      <button data-test-id="login-button" onClick={() => signOut()}>
        ログアウト
      </button>
    </main>
  );
};
