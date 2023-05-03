import type { User } from "@prisma/client";
import { useSession } from "next-auth/react";
import type { FC } from "react";

import { FollowButton } from "./parts/FollowButton";

type Props = {
  user: Pick<User, "id" | "name" | "preferredUsername" | "host">;
};

export const UserCard: FC<Props> = ({ user }) => {
  const { data: sessionData } = useSession();
  const canFollow = sessionData?.user?.id !== user.id;
  return (
    <div>
      <p>
        {user.name}
        <span>@{user.preferredUsername}</span>
        <span>{user.host && `@${user.host}`}</span>
      </p>
      {canFollow && <FollowButton userId={user.id} />}
    </div>
  );
};
