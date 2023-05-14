import { notFound } from "next/navigation";

import { UserCard } from "@/components/UserCard";
import { findOrFetchUserByParams } from "@/utils/findOrFetchUser";

export default async function UserPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await findOrFetchUserByParams(params);
  if (!user) {
    notFound();
  }
  // @ts-expect-error
  return <UserCard user={user} />;
}
