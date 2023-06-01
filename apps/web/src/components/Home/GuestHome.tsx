import { prisma } from "@soshal/database";

import { Timeline } from "../Timeline";
import { SignInOrOutButton } from "./parts/LoginButton";

export async function GuestHome() {
  const notes = await prisma.note.findMany({
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
