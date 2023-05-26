import { prisma } from "@/server/prisma";
import { getServerSession } from "@/utils/getServerSession";

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
  return <Client followeeId={followeeId} followStatus={follow?.status} />;
}
