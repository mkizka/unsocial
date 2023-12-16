import Link from "next/link";
import { notFound } from "next/navigation";

import { UserIcon } from "@/_shared/components/user/UserIcon";
import { userService } from "@/_shared/service/user";
import { env } from "@/_shared/utils/env";
import { fullUsername } from "@/_shared/utils/fullUsername";
import { getSessionUserId } from "@/_shared/utils/session";

import { FollowButton } from "./FollowButton";
import { followCountService } from "./followCountService";
import { RefetchButton } from "./RefetchButton";

type Props = {
  userKey: string;
};

export async function UserCard({ userKey }: Props) {
  const sessionUserId = await getSessionUserId();
  const user = await userService.findOrFetchUserByKey(userKey);
  if (user instanceof Error) {
    notFound();
  }
  const { followersCount, followeesCount } = await followCountService.count(
    user.id,
  );
  const canFollow = sessionUserId !== user.id;
  return (
    <section className="mb-1 space-y-4 rounded bg-primary-light p-4 pb-6 shadow">
      <div className="flex w-full items-center">
        <UserIcon user={user} size={64} className="rounded-full" />
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="text-gray">{fullUsername(user)}</div>
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
        {canFollow && <FollowButton followeeId={user.id} />}
        {env.HOST !== user.host && <RefetchButton userId={user.id} />}
      </div>
    </section>
  );
}
