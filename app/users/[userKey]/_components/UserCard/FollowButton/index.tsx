import { userSessionService } from "@/_shared/user/services/userSessionService";
import { prisma } from "@/_shared/utils/prisma";

import { FollowButton as Client } from "./client";

export async function FollowButton({ followeeId }: { followeeId: string }) {
  const userId = await userSessionService.getUserId();
  if (!userId) {
    return null;
  }
  const follow = await prisma.follow.findFirst({
    where: {
      followeeId,
      followerId: userId,
    },
  });
  return <Client followeeId={followeeId} followStatus={follow?.status} />;
}
