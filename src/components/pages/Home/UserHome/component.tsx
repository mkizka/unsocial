import type { Session } from "next-auth";

import { NoteForm } from "@/components/features/note/NoteForm";
import { Timeline } from "@/components/features/note/Timeline";
import { SignOutButton } from "@/components/pages/Home/LoginButton";

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
