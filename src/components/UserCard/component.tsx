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
    <div className="bg-primary-light rounded p-4 mb-4 shadow">
      <div className="flex items-center space-x-2">
        <UserIcon user={user} width={64} height={64} className="rounded-full" />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="text-gray">
            @{user.preferredUsername}@{user.host}
          </div>
        </div>
      </div>
      {env.HOST != user.host && (
        <div className="flex justify-end">
          <RefetchButton userId={user.id} />
        </div>
      )}
      {canFollow && (
        <div className="flex justify-end">
          <FollowButton followeeId={user.id} />
        </div>
      )}
    </div>
  );
}
