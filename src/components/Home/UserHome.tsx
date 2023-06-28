import type { Session } from "next-auth";

import { prisma } from "@/utils/prisma";

import { NoteForm } from "../NoteForm";
import { Timeline } from "../Timeline";
import { SignOutButton } from "./parts/LoginButton";

type Props = {
  user: NonNullable<Session["user"]>;
};

export async function UserHome({ user }: Props) {
  const notes = await prisma.note.findMany({
    include: {
      user: true,
      likes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <main>
      <p data-testid="is-logged-in">{user.id}でログイン中</p>
      <SignOutButton />
      <NoteForm />
      <Timeline notes={notes} />
    </main>
  );
}
