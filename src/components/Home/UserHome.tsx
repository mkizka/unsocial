import type { Session } from "next-auth";

import { NoteForm } from "../NoteForm";
import { SignInOrOutButton } from "./parts/LoginButton";

type Props = {
  user: NonNullable<Session["user"]>;
};

export function UserHome({ user }: Props) {
  return (
    <main>
      <p data-testid="is-logged-in">{user.name}でログイン中</p>
      <SignInOrOutButton isAuthenticated />
      <NoteForm />
    </main>
  );
}
