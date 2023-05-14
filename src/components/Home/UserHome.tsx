import type { Session } from "next-auth";

import { prisma } from "@/server/prisma";

import { NoteForm } from "../NoteForm";
import { Timeline } from "../Timeline";
import { SignInOrOutButton } from "./parts/LoginButton";

type Props = {
  user: NonNullable<Session["user"]>;
};

export async function UserHome({ user }: Props) {
  const notes = await prisma.note.findMany({
    where: {
      userId: user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          preferredUsername: true,
          host: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
  });
  return (
    <main>
      <p data-testid="is-logged-in">{user.name}でログイン中</p>
      <SignInOrOutButton isAuthenticated />
      <NoteForm />
      <Timeline notes={notes} />
    </main>
  );
}
