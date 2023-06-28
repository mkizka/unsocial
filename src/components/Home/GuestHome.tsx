import Link from "next/link";

import { prisma } from "@/utils/prisma";

import { Timeline } from "../Timeline";

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
      <Link href="/auth">ログイン</Link>
      <Timeline notes={notes} />
    </main>
  );
}
