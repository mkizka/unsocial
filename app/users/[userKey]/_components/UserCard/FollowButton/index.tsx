import { prisma } from "@/_shared/utils/prisma";
import { getSessionUserId } from "@/_shared/utils/session";

import { FollowButton as Client } from "./client";

export async function FollowButton({ followeeId }: { followeeId: string }) {
  const userId = await getSessionUserId({ redirect: true });
  const follow = await prisma.follow.findFirst({
    where: {
      followeeId,
      followerId: userId,
    },
  });
  return <Client followeeId={followeeId} followStatus={follow?.status} />;
}
