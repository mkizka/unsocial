import { notFound } from "next/navigation";

import { Timeline } from "@/components/Timeline";
import { UserCard } from "@/components/UserCard";
import { findOrFetchUserByParams } from "@/utils/findOrFetchUser";
import { prisma } from "@/utils/prisma";

export default async function UserPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await findOrFetchUserByParams(params);
  if (!user) {
    notFound();
  }
  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: { user: true, likes: true },
  });
  return (
    <>
      <UserCard user={user} />
      <Timeline notes={notes} />
    </>
  );
}
