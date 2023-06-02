import type { User } from "@soshal/database";

import { getServerSession } from "@/utils/getServerSession";

import { FollowButton } from "./parts/FollowButton";

export type Props = {
  user: Pick<User, "id" | "name" | "preferredUsername" | "host">;
};

export async function UserCard({ user }: Props) {
  const session = await getServerSession();
  const canFollow = session?.user && session.user.id != user.id;

  return (
    <div>
      <p>
        {user.name}
        <span>@{user.preferredUsername}</span>
        <span>{user.host && `@${user.host}`}</span>
      </p>
      {canFollow && (
        // @ts-expect-error
        <FollowButton followeeId={user.id} />
      )}
    </div>
  );
}
