import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import type { FC } from "react";

import { Timeline } from "../Timeline";

type Props = {
  user: NonNullable<Session["user"]>;
};

export const UserHome: FC<Props> = ({ user }) => {
  return (
    <main>
      <p data-testid="is-logged-in">{user.name}でログイン中</p>
      <button data-testid="login-button" onClick={() => signOut()}>
        ログアウト
      </button>
      <Timeline />
    </main>
  );
};
