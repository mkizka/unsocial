import { notFound } from "next/navigation";

import { Timeline } from "@/components/Timeline";
import { UserCard } from "@/components/UserCard";
import { noteService, userService } from "@/server/service";

export default async function UserPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await userService.findOrFetchUserByParams(params);
  if (!user) {
    notFound();
  }
  const notes = await noteService.findManyNoteCardsByUserId(user.id);
  return (
    <>
      <UserCard user={user} />
      <Timeline notes={notes} />
    </>
  );
}
