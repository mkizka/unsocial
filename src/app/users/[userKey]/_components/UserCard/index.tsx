import Link from "next/link";
import { notFound } from "next/navigation";

import { UserIcon } from "@/app/_shared/components/user/UserIcon";
import { userService } from "@/app/_shared/service/user";
import { env } from "@/app/_shared/utils/env";
import { fullUsername } from "@/app/_shared/utils/fullUsername";
import { getServerSession } from "@/app/_shared/utils/getServerSession";

import { FollowButton } from "./FollowButton";
import { followCountService } from "./followCountService";
import { RefetchButton } from "./RefetchButton";

export type Props = {
  userKey: string;
};

export async function UserCard({ userKey }: Props) {
  const session = await getServerSession();
  const user = await userService.findOrFetchUserByKey(userKey);
  if (user instanceof Error) {
    notFound();
  }
  const { followersCount, followeesCount } = await followCountService.count(
    user.id,
  );
  const canFollow = session?.user && session.user.id !== user.id;
  return (
    <section className="mb-1 rounded bg-primary-light p-4 pb-6 shadow">
      <div className="mb-2 flex w-full items-center">
        <UserIcon user={user} size={64} className="rounded-full" />
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="text-gray">{fullUsername(user)}</div>
        </div>
      </div>
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
