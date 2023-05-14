import { revalidatePath } from "next/cache";

import { prisma } from "@/server/prisma";
import { getServerSession } from "@/utils/getServerSession";

import { action } from "./action";
import { FollowButton as Client } from "./client";

export async function FollowButton({ followeeId }: { followeeId: string }) {
  const session = await getServerSession();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) {
    return null;
  }
  const follow = await prisma.follow.findFirst({
    where: {
      followeeId,
      followerId: sessionUserId,
    },
  });

  async function handleClick() {
    "use server";
    await action({ followeeId });
    revalidatePath(`/users/${followeeId}`);
  }

  return <Client follow={follow} onClick={handleClick} />;
}
