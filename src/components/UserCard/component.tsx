import type { User } from "@prisma/client";

import { env } from "@/utils/env";
import { getServerSession } from "@/utils/getServerSession";

import { UserIcon } from "../UserIcon";
import { FollowButton } from "./parts/FollowButton";
import { RefetchButton } from "./parts/RefetchButton";

export type Props = {
  user: Pick<
    User,
    "id" | "name" | "preferredUsername" | "host" | "lastFetchedAt"
  >;
};

export async function UserCard({ user }: Props) {
  const session = await getServerSession();
  const canFollow = session?.user && session.user.id != user.id;

  return (
    <div className="mb-4 rounded bg-primary-light p-4 pb-8 shadow">
      <div className="flex w-full items-center">
        <UserIcon user={user} width={64} height={64} className="rounded-full" />
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="text-gray">
            @{user.preferredUsername}@{user.host}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {canFollow && <FollowButton followeeId={user.id} />}
          {env.HOST != user.host && <RefetchButton userId={user.id} />}
        </div>
      </div>
    </div>
  );
}
