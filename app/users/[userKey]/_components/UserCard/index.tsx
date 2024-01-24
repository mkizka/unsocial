import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/_shared/ui/Card";
import { UserIcon } from "@/_shared/user/components/UserIcon";
import { userFindService } from "@/_shared/user/services/userFindService";
import { userSessionService } from "@/_shared/user/services/userSessionService";
import { env } from "@/_shared/utils/env";
import { fullUsername } from "@/_shared/utils/fullUsername";

import { FollowButton } from "./FollowButton";
import { followCountService } from "./followCountService";
import { RefetchButton } from "./RefetchButton";

type Props = {
  userKey: string;
};

export async function UserCard({ userKey }: Props) {
  const sessionUserId = await userSessionService.getUserId();
  const user = await userFindService.findOrFetchUserByKey(userKey);
  if (user instanceof Error) {
    notFound();
  }
  const { followersCount, followeesCount } = await followCountService.count(
    user.id,
  );
  const canFollow = sessionUserId !== user.id;
  return (
    <Card as="section" className="mb-1 space-y-4 pb-6">
      <div className="flex w-full items-center">
        <UserIcon user={user} size={64} className="rounded-full" />
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div>{fullUsername(user)}</div>
        </div>
      </div>
      <div>{user.summary}</div>
      <div className="flex items-center gap-2">
        <Link
          href={`/${fullUsername(user)}/followees`}
          className="hover:underline"
          data-testid="user-followees"
        >
          <span className="font-bold">{followeesCount}</span>
          <span className="ml-1">フォロー</span>
        </Link>
        <Link
          href={`/${fullUsername(user)}/followers`}
          className="hover:underline"
          data-testid="user-followers"
        >
          <span className="font-bold">{followersCount}</span>
          <span className="ml-1">フォロワー</span>
        </Link>
        <div className="ml-auto">
          {canFollow && <FollowButton followeeId={user.id} />}
          {env.UNSOCIAL_HOST !== user.host && (
            <RefetchButton userId={user.id} />
          )}
        </div>
      </div>
    </Card>
  );
}
