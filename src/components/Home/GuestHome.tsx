import { prisma } from "@/utils/prisma";

import { Timeline } from "../Timeline";
import { SignInOrOutButton } from "./parts/LoginButton";

export async function GuestHome() {
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
      <SignInOrOutButton />
      <Timeline notes={notes} />
    </main>
  );
}
