import type { Session } from "next-auth";

import { NoteForm } from "../NoteForm";
import { Timeline } from "../Timeline";
import { SignOutButton } from "./parts/LoginButton";

type Props = {
  user: NonNullable<Session["user"]>;
};

export async function UserHome({ user }: Props) {
  return (
    <main>
      <p data-testid="is-logged-in">{user.id}でログイン中</p>
      <SignOutButton />
      <NoteForm />
      <Timeline />
    </main>
  );
}
