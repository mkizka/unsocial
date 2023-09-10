import Link from "next/link";
import { notFound } from "next/navigation";

import { followService, userService } from "@/server/service";
import { env } from "@/utils/env";
import { getServerSession } from "@/utils/getServerSession";

import { UserIcon } from "../UserIcon";
import { FollowButton } from "./FollowButton";
import { RefetchButton } from "./RefetchButton";

export type Props = {
  userId: string;
};

export async function UserCard({ userId }: Props) {
  const session = await getServerSession();
  const user = await userService.findOrFetchUserByParams({ userId });
  if (!user) {
    notFound();
  }
  const { followersCount, followeesCount } = await followService.count(user.id);
  const canFollow = session?.user && session.user.id !== user.id;
  return (
    <section className="mb-4 rounded bg-primary-light p-4 pb-6 shadow">
      <div className="mb-2 flex w-full items-center">
        <UserIcon user={user} width={64} height={64} className="rounded-full" />
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="text-gray">
            @{user.preferredUsername}@{user.host}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/@${user.preferredUsername}/followees`}
          className="hover:underline"
          data-testid="user-followees"
        >
          <span className="font-bold">{followeesCount}</span>
          <span className="ml-1">フォロー</span>
        </Link>
        <Link
          href={`/@${user.preferredUsername}/followers`}
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
